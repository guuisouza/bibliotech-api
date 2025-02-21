import { Injectable, NotFoundException } from '@nestjs/common'
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

  async findAll() {
    const books = await this.prisma.book.findMany({
      select: {
        id: true,
        title: true,
        available: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!books) {
      throw new NotFoundException('books not found')
    }

    return books
  }

  async findOne(id: number) {
    await this.checkIfBookExists(id)

    return this.prisma.book.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        available: true,
        createdAt: true,
        updatedAt: true,
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

    return this.prisma.book.delete({
      where: { id }
    })
  }

  async checkIfBookExists(id: number) {
    if (!(await this.prisma.book.count({ where: { id } }))) {
      throw new NotFoundException(`book id ${id} does not exist`)
    }
  }
}
