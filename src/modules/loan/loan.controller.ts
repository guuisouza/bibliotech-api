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
import { CreateLoanDTO } from './dto/create-loan.dto'
import { LoanService } from './loan.service'
import { JwtAuthGuard } from '../../guards/jwt-auth-guard'
import { FiltersQueryLoanDTO } from './dto/filters-query-loan.dto'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse
} from '@nestjs/swagger'
import {
  ApiCreateLoanBadRequestResponse,
  ApiCreateLoanConflictResponse
} from '../../swagger/responses/loan.responses'
import {
  ApiSharedLoanNotFoundResponse,
  ApiSharedUnauthorizedResponse
} from '../../swagger/responses/shared.responses'

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @ApiOperation({ summary: 'Create a new loan' })
  @ApiResponse({
    status: 200,
    description: 'Loan created successfully',
    example: {
      id: 1,
      studentId: 1,
      bookId: 1,
      loanDate: '2025-03-25T21:23:24.000Z',
      dueDate: '2025-03-26T00:00:00.000Z',
      isActive: true,
      returnDate: null,
      createdAt: '2025-03-25T21:23:24.000Z',
      updatedAt: '2025-03-25T21:23:24.000Z'
    }
  })
  @ApiCreateLoanBadRequestResponse()
  @ApiSharedUnauthorizedResponse()
  @ApiCreateLoanConflictResponse()
  @Post()
  async create(@Body() data: CreateLoanDTO) {
    return this.loanService.create(data)
  }

  @ApiOperation({ summary: 'Get all loans with filters and pagination' })
  @ApiQuery({ name: 'studentId', required: false, example: 1 })
  @ApiQuery({ name: 'bookId', required: false, example: 1 })
  @ApiQuery({ name: 'loanDateStart', required: false, example: '2025-03-23' })
  @ApiQuery({ name: 'loanDateLimit', required: false, example: '2025-03-27' })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['loanDate', 'dueDate'],
    example: 'loanDate'
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
    description: 'List of all loans with pagination',
    example: {
      total: 1,
      page: 1,
      perPage: 5,
      totalPages: 1,
      data: [
        {
          id: 1,
          loanDate: '2025-03-25T21:23:24.000Z',
          dueDate: '2025-03-26T00:00:00.000Z',
          isActive: true,
          student: {
            name: 'Alice Oliveira',
            academicRegistration: '2025123456899'
          },
          book: {
            title: 'Animal Farm'
          }
        }
      ]
    }
  })
  @ApiSharedUnauthorizedResponse()
  @Get()
  async findAll(@Query() filters: FiltersQueryLoanDTO) {
    return this.loanService.findAll(filters)
  }

  @ApiOperation({
    summary: 'Get a single loan with their detailed information'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Loan ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description:
      'Successful response with all detailed loan information, including who rented it and the book rented',
    example: {
      id: 1,
      loanDate: '2025-03-25T21:23:24.000Z',
      dueDate: '2025-03-26T00:00:00.000Z',
      isActive: true,
      returnDate: null,
      student: {
        id: 1,
        name: 'Alice Oliveira',
        email: 'alice.oliveira.souza@hotmail.com',
        academicRegistration: '2025123456899'
      },
      book: {
        id: 1,
        title: 'Animal Farm'
      },
      createdAt: '2025-03-25T21:23:24.000Z',
      updatedAt: '2025-03-25T21:23:24.000Z'
    }
  })
  @ApiSharedUnauthorizedResponse()
  @ApiSharedLoanNotFoundResponse()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.findOne(id)
  }

  @ApiOperation({
    summary: 'Returns the loan'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Loan ID',
    example: 1
  })
  @ApiResponse({
    status: 204,
    description: 'No Content - The loan was returned successfully.'
  })
  @ApiSharedUnauthorizedResponse()
  @ApiSharedLoanNotFoundResponse()
  @ApiResponse({
    status: 409,
    description: 'Conflict - this loan has already been returned'
  })
  @Patch(':id/return')
  async closeLoan(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.closeLoan(id)
  }

  @ApiOperation({
    summary: 'Delete a single loan'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Loan ID',
    example: 1
  })
  @ApiResponse({
    status: 204,
    description: 'No Content - Loan successfully deleted'
  })
  @ApiSharedUnauthorizedResponse()
  @ApiSharedLoanNotFoundResponse()
  @ApiResponse({
    status: 409,
    description: 'Conflict - this loan is active and cannot be deleted'
  })
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.delete(id)
  }
}
