import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common'
import { CreateBookDTO } from './dto/create-book.dto'
import { BookService } from './book.service'
import { UpdatePatchBookDTO } from './dto/update-patch-book.dto'
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard'
import { FiltersQueryBookDTO } from './dto/filters-query-book.dto'

@UseGuards(JwtAuthGuard)
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  async create(@Body() data: CreateBookDTO) {
    return this.bookService.create(data)
  }

  @Get()
  async findAll(@Query() filters: FiltersQueryBookDTO) {
    return this.bookService.findAll(filters)
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
