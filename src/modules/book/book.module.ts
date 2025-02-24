import { Module } from '@nestjs/common'
import { BookController } from './book.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { BookService } from './book.service'
import { AuthorModule } from '../author/author.module'

@Module({
  imports: [PrismaModule, AuthorModule],
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService]
})
export class BookModule {}
