import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBookDTO } from './dto/create-book.dto'
import { AuthorService } from '../author/author.service'
import { UpdatePatchBookDTO } from './dto/update-patch-book.dto'

@Injectable()
export class BookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorService: AuthorService
  ) {}

  async create(data: CreateBookDTO) {
    await this.authorService.checkIfAuthorExists(data.authorId)

    return this.prisma.book.create({ data })
  }

  async findAll(isAvailable?: boolean) {
    const books = await this.prisma.book.findMany({
      where: isAvailable !== undefined ? { isAvailable } : {},
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

    return books
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
