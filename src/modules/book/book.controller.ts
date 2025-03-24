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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse
} from '@nestjs/swagger'

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({
    status: 201,
    description: 'Book created successfully',
    schema: {
      example: {
        id: 1,
        title: 'Animal Farm',
        genre: 'Satire',
        authorId: 1,
        isAvailable: true,
        isbn: '9788535909553',
        yearPublished: 1945,
        createdAt: '2025-03-24T19:56:45.000Z',
        updatedAt: '2025-03-24T19:56:45.000Z'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - author id 55 does not exist'
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - book already exists'
  })
  @Post()
  async create(@Body() data: CreateBookDTO) {
    return this.bookService.create(data)
  }

  @ApiOperation({ summary: 'Get all books with filters and pagination' })
  @ApiQuery({ name: 'title', required: false, example: 'Animal Farm' })
  @ApiQuery({ name: 'genre', required: false, example: 'Satire' })
  @ApiQuery({ name: 'yearPublishedAfter', required: false, example: 1900 })
  @ApiQuery({ name: 'yearPublishedBefore', required: false, example: 2000 })
  @ApiQuery({ name: 'isbn', required: false, example: '9788535909553' })
  @ApiQuery({ name: 'isAvailable', required: false, example: true })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['title', 'yearPublished'],
    example: 'title'
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    enum: ['asc', 'desc'],
    example: 'asc'
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 5 })
  @ApiResponse({
    status: 200,
    description: 'List of books with pagination',
    schema: {
      example: {
        total: 1,
        page: 1,
        perPage: 5,
        totalPages: 1,
        data: [
          {
            id: 1,
            title: 'Animal Farm',
            genre: 'Satire',
            isbn: '9788535909553',
            yearPublished: 1945,
            isAvailable: true,
            author: {
              id: 1,
              name: 'George Orwell'
            }
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @Get()
  async findAll(@Query() filters: FiltersQueryBookDTO) {
    return this.bookService.findAll(filters)
  }

  @ApiOperation({
    summary: 'Get a single book with their detailed information'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Book ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description:
      'Successful response with all the detailed information of the book',
    schema: {
      example: {
        id: 1,
        title: 'Animal Farm',
        genre: 'Satire',
        authorId: 1,
        isAvailable: true,
        isbn: '9788535909553',
        yearPublished: 1945,
        createdAt: '2025-03-24T19:56:45.000Z',
        updatedAt: '2025-03-24T19:56:45.000Z',
        author: {
          id: 1,
          name: 'George Orwell'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - book id 23 does not exist'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.findOne(id)
  }

  @ApiOperation({
    summary: 'Optionally update book fields'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Book ID',
    example: 1
  })
  @ApiBody({
    description: 'Fields to update (optional)',
    type: UpdatePatchBookDTO,
    examples: {
      example1: {
        summary: 'Update title and genre',
        value: {
          title: 'Animal Farm - New Edition',
          genre: 'Political Satire'
        }
      },
      example2: {
        summary: 'Update ISBN',
        value: {
          isbn: '9780451526342'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Book successfully updated',
    schema: {
      example: {
        id: 1,
        title: 'Animal Farm - New Edition',
        genre: 'Political Satire',
        authorId: 1,
        isbn: '9780451526342',
        yearPublished: 1945,
        createdAt: '2025-03-24T19:56:45.000Z',
        updatedAt: '2025-03-24T20:29:30.000Z'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - book id 23 does not exist'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @Patch(':id')
  async update(
    @Body() data: UpdatePatchBookDTO,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.bookService.update(data, id)
  }

  @ApiOperation({
    summary: 'Delete a single book'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Book ID',
    example: 1
  })
  @ApiResponse({
    status: 204,
    description: 'Book successfully deleted'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - this book is still on loan and cannot be deleted.'
  })
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.delete(id)
  }
}
