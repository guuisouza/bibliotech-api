import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards
} from '@nestjs/common'
import { AuthorService } from './author.service'
import { CreateAuthorDTO } from './dto/create-author.dto'
import { JwtAuthGuard } from '../../guards/jwt-auth-guard'
import { FiltersQueryAuthorDTO } from './dto/filters-query-author.dto'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import {
  ApiSharedUnauthorizedResponse,
  ApiSharedAuthorNotFoundResponse
} from 'src/swagger/responses/shared.responses'
import {
  ApiAuthorBadRequestResponse,
  ApiAuthorConflictResponse
} from 'src/swagger/responses/author.responses'

@ApiTags('Authors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @ApiOperation({ summary: 'Create a new author' })
  @ApiResponse({
    status: 201,
    description: 'Author created successfully',
    example: {
      id: 1,
      name: 'George Orwell',
      nationality: 'Britânico',
      birthYear: 1903,
      createdAt: '2025-03-21T20:36:23.000Z',
      updatedAt: '2025-03-21T20:36:23.000Z'
    }
  })
  @ApiAuthorBadRequestResponse()
  @ApiSharedUnauthorizedResponse()
  @ApiAuthorConflictResponse()
  @Post()
  async create(@Body() data: CreateAuthorDTO) {
    return this.authorService.create(data)
  }

  @ApiOperation({ summary: 'Get all authors with filters and pagination' })
  @ApiQuery({ name: 'name', required: false, example: 'George Orwell' })
  @ApiQuery({ name: 'birthYearAfter', required: false, example: 1900 })
  @ApiQuery({ name: 'birthYearBefore', required: false, example: 2000 })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['name', 'birthYear'],
    example: 'name'
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
    description: 'List of authors with pagination',
    example: {
      total: 1,
      page: 1,
      perPage: 5,
      totalPages: 1,
      data: [
        {
          id: 1,
          name: 'George Orwell',
          nationality: 'Britânico',
          birthYear: 1903
        }
      ]
    }
  })
  @ApiSharedUnauthorizedResponse()
  @Get()
  async findAll(@Query() filters: FiltersQueryAuthorDTO) {
    return this.authorService.findAll(filters)
  }

  @ApiOperation({
    summary: 'Get a single author with their detailed information'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Author ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response with author details and books',
    example: {
      id: 1,
      name: 'George Orwell',
      nationality: 'Britânico',
      birthYear: 1903,
      createdAt: '2025-03-14T18:53:09.000Z',
      updatedAt: '2025-03-14T18:53:09.000Z',
      books: [
        {
          id: 1,
          title: '1984',
          genre: 'Distopia',
          authorId: 6,
          totalQuantity: 15,
          availableQuantity: 15,
          isbn: '9780451524935',
          yearPublished: 1949,
          createdAt: '2025-03-14T19:07:06.000Z',
          updatedAt: '2025-03-14T19:07:06.000Z'
        }
      ]
    }
  })
  @ApiSharedUnauthorizedResponse()
  @ApiSharedAuthorNotFoundResponse()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.findOne(id)
  }

  @ApiOperation({
    summary: 'Delete a single author'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Author ID',
    example: 1
  })
  @ApiResponse({
    status: 204,
    description: 'No Content - Author successfully deleted'
  })
  @ApiSharedUnauthorizedResponse()
  @ApiSharedAuthorNotFoundResponse()
  @ApiResponse({
    status: 409,
    description:
      "Conflict - you can't exclude this author because he has books associated with him"
  })
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.delete(id)
  }
}
