import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from '@nestjs/common'
import { CreateLoanDTO } from './dto/create-loan.dto'
import { LoanService } from './loan.service'

@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  async create(@Body() data: CreateLoanDTO) {
    return this.loanService.create(data)
  }

  @Get()
  async findAll() {
    return this.loanService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.findOne(id)
  }

  @Patch(':id/return')
  async closeLoan(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.closeLoan(id)
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.delete(id)
  }
}
