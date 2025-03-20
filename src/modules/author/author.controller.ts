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
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard'
import { FiltersQueryAuthorDTO } from './dto/filters-query-author.dto'

@UseGuards(JwtAuthGuard)
@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  async create(@Body() data: CreateAuthorDTO) {
    return this.authorService.create(data)
  }

  @Get()
  async findAll(@Query() filters: FiltersQueryAuthorDTO) {
    return this.authorService.findAll(filters)
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.findOne(id)
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.delete(id)
  }
}
