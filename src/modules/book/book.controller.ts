import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from '@nestjs/common'
import { CreateBookDTO } from './dto/create-book.dto'
import { BookService } from './book.service'
import { UpdatePatchBookDTO } from './dto/update-patch-book.dto'

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  async create(@Body() data: CreateBookDTO) {
    return this.bookService.create(data)
  }

  @Get()
  async findAll() {
    return this.bookService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.findOne(id)
  }

  @Patch(':id')
  async update(
    @Body() data: UpdatePatchBookDTO,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.bookService.update(data, id)
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.delete(id)
  }
}
