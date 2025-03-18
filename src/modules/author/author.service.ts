import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAuthorDTO } from './dto/create-author.dto'

@Injectable()
export class AuthorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuthorDTO) {
    const existingAuthor = await this.prisma.author.count({
      where: {
        name: data.name
      }
    })

    if (existingAuthor > 0) {
      throw new ConflictException('author already exists')
    }

    return this.prisma.author.create({ data })
  }

  async findAll() {
    const authors = await this.prisma.author.findMany({
      select: {
        id: true,
        name: true,
        nationality: true,
        birthYear: true
      }
    })

    return authors
  }

  async findOne(id: number) {
    await this.checkIfAuthorExists(id)

    return this.prisma.author.findUnique({
      where: {
        id
      },
      include: {
        books: true
      }
    })
  }

  async delete(id: number) {
    await this.checkIfAuthorExists(id)

    const authorWithBooks = await this.prisma.book.count({
      where: {
        authorId: id
      }
    })

    if (authorWithBooks > 0) {
      throw new ConflictException(
        "you can't exclude this author because he has books associated with him"
      )
    }

    await this.prisma.author.delete({
      where: { id }
    })
  }

  async checkIfAuthorExists(id: number) {
    const author = await this.prisma.author.findUnique({
      where: {
        id
      }
    })

    if (!author) {
      throw new NotFoundException(`author id ${id} does not exist`)
    }
  }
}
