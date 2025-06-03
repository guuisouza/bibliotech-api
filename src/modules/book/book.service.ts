import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBookDTO } from './dto/create-book.dto'
import { AuthorService } from '../author/author.service'
import { UpdatePatchBookDTO } from './dto/update-patch-book.dto'
import { FiltersQueryBookDTO } from './dto/filters-query-book.dto'
import { AddBookInventoryDTO } from './dto/add-book-inventory.dto'
import { RemoveBookInventoryDTO } from './dto/remove-book-inventory.dto'

@Injectable()
export class BookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorService: AuthorService
  ) {}

  async create(data: CreateBookDTO) {
    const existingBook = await this.prisma.book.count({
      where: {
        title: data.title
      }
    })

    const isbnExists = await this.findBookByIsbn(data.isbn)
    if (existingBook > 0 || isbnExists) {
      throw new ConflictException('this book already exists')
    }

    await this.authorService.checkIfAuthorExists(data.authorId)

    return this.prisma.book.create({
      data: {
        ...data,
        availableQuantity: data.totalQuantity
      }
    })
  }

  async findAll(filters: FiltersQueryBookDTO) {
    const {
      title,
      genre,
      yearPublishedAfter,
      yearPublishedBefore,
      isbn,
      isAvailable,
      orderBy,
      orderDirection,
      page,
      perPage
    } = filters

    const whereClause = {
      title: title ? { contains: title } : undefined,
      genre: genre ? { contains: genre } : undefined,
      isbn: isbn ? { equals: isbn } : undefined,
      availableQuantity:
        isAvailable === true
          ? { gt: 0 }
          : isAvailable === false
            ? { equals: 0 }
            : undefined,
      yearPublished: {
        gte: yearPublishedAfter,
        lte: yearPublishedBefore
      }
    }

    const books = await this.prisma.book.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      where: whereClause,
      orderBy: orderBy ? { [orderBy]: orderDirection } : undefined,
      select: {
        id: true,
        title: true,
        genre: true,
        isbn: true,
        yearPublished: true,
        availableQuantity: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const total = await this.prisma.book.count({
      where: whereClause
    })

    return {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      data: books
    }
  }

  async findOne(id: number) {
    await this.checkIfBookExists(id)

    return this.prisma.book.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  async update(data: UpdatePatchBookDTO, id: number) {
    await this.checkIfBookExists(id)

    const dataToUpdate = {}

    if (data.title && data.title.trim() !== '') {
      const titleExists = await this.findBookByTitle(data.title)
      if (titleExists && titleExists.id !== id) {
        throw new ConflictException('this book already exists')
      }
      dataToUpdate['title'] = data.title
    }

    if (data.authorId) {
      await this.authorService.checkIfAuthorExists(data.authorId)
      dataToUpdate['authorId'] = data.authorId
    }

    if (data.genre && data.genre.trim() !== '') {
      dataToUpdate['genre'] = data.genre
    }

    if (data.isbn && data.isbn.trim() !== '') {
      const isbnExists = await this.findBookByIsbn(data.isbn)
      if (isbnExists && isbnExists.id !== id) {
        throw new ConflictException('this book isbn already exists')
      }
      dataToUpdate['isbn'] = data.isbn
    }

    if (data.yearPublished) {
      dataToUpdate['yearPublished'] = data.yearPublished
    }

    if (
      Object.keys(dataToUpdate).some(
        (key) => dataToUpdate[key] !== undefined && dataToUpdate[key] !== null
      )
    ) {
      dataToUpdate['updatedAt'] = new Date(Date.now()).toISOString()
    }

    return this.prisma.book.update({
      where: { id },
      data: dataToUpdate,
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  async delete(id: number) {
    await this.checkIfBookExists(id)

    const activeLoans = await this.prisma.loan.count({
      where: { bookId: id, isActive: true }
    })

    if (activeLoans > 0) {
      throw new ConflictException(
        'this book is still on loan and cannot be deleted.'
      )
    }

    return this.prisma.book.delete({
      where: { id }
    })
  }

  async checkIfBookExists(id: number) {
    const book = await this.prisma.book.findUnique({
      where: {
        id
      }
    })

    if (!book) {
      throw new NotFoundException(`book id ${id} does not exist`)
    }
  }

  async findBookByTitle(title: string) {
    return this.prisma.book.findFirst({
      where: { title }
    })
  }

  async findBookByIsbn(isbn: string) {
    return this.prisma.book.findFirst({
      where: { isbn }
    })
  }

  async addBooksToInventory(id: number, data: AddBookInventoryDTO) {
    await this.checkIfBookExists(id)

    const updatedValues = await this.prisma.book.update({
      where: { id },
      data: {
        totalQuantity: { increment: data.amount },
        availableQuantity: { increment: data.amount }
      }
    })

    return updatedValues
  }

  async removeBooksToInventory(id: number, data: RemoveBookInventoryDTO) {
    const book = await this.prisma.book.findUnique({
      where: { id }
    })

    if (!book) {
      throw new NotFoundException(`book id ${id} does not exist`)
    }

    if (data.amount > book.availableQuantity) {
      throw new ConflictException(
        `cannot remove more than ${book.availableQuantity} available books`
      )
    }

    const updatedValues = await this.prisma.book.update({
      where: { id },
      data: {
        totalQuantity: { decrement: data.amount },
        availableQuantity: { decrement: data.amount }
      }
    })

    return updatedValues
  }
}
