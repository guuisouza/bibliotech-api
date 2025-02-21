import {
  BadRequestException,
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
    if (data.name.trim() === '') {
      throw new BadRequestException('name should not be empty')
    }

    return this.prisma.author.create({ data })
  }

  async findAll() {
    const authors = await this.prisma.author.findMany()

    if (!authors) {
      throw new NotFoundException('authors not found')
    }

    return authors
  }

  async findOne(id: number) {
    await this.checkIfAuthorExists(id)

    return this.prisma.author.findUnique({
      where: { id }
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
    if (!(await this.prisma.author.count({ where: { id } }))) {
      throw new NotFoundException(`author id ${id} does not exist`)
    }
  }
}
