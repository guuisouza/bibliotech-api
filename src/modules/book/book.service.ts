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

    if (existingBook > 0) {
      throw new ConflictException('book already exists')
    }

    await this.authorService.checkIfAuthorExists(data.authorId)

    return this.prisma.book.create({ data })
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

    const books = await this.prisma.book.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      where: {
        title: title ? { contains: title } : undefined,
        genre: genre ? { contains: genre } : undefined,
        isbn: isbn ? { equals: isbn } : undefined,
        isAvailable,
        yearPublished: {
          gte: yearPublishedAfter,
          lte: yearPublishedBefore
        }
      },
      orderBy: orderBy ? { [orderBy]: orderDirection } : undefined,
      select: {
        id: true,
        title: true,
        genre: true,
        isbn: true,
        yearPublished: true,
        isAvailable: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const total = await this.prisma.book.count({
      where: {
        title: title ? { contains: title } : undefined,
        genre: genre ? { contains: genre } : undefined,
        yearPublished: {
          gte: yearPublishedAfter,
          lte: yearPublishedBefore
        },
        isbn: isbn ? { equals: isbn } : undefined,
        isAvailable
      }
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

    if (data.title) {
      dataToUpdate['title'] = data.title
    }

    if (data.authorId) {
      await this.authorService.checkIfAuthorExists(data.authorId)
      dataToUpdate['authorId'] = data.authorId
    }

    if (data.genre) {
      dataToUpdate['genre'] = data.genre
    }

    if (data.isbn) {
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

  async checkIfBookIsRented(id: number) {
    const book = await this.prisma.book.findUnique({
      where: {
        id,
        isAvailable: true
      }
    })

    if (!book) {
      throw new ConflictException('this book is already rented')
    }
  }

  async setBookAvailability(id: number, isAvailable: boolean) {
    await this.prisma.book.update({
      where: { id },
      data: {
        isAvailable
      }
    })
  }
}
