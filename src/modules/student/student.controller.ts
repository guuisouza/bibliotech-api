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
import { StudentService } from './student.service'
import { CreateStudentDTO } from './dto/create-student.dto'
import { UpdatePatchStudentDTO } from './dto/update-patch-student.dto'
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard'
import { FiltersQueryStudentDTO } from './dto/filters-query-student.dto'
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
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({
    status: 201,
    description: 'Student created successfully',
    example: {
      id: 1,
      name: 'Alice Oliveira',
      email: 'alice.oliveira@email.com',
      phone: '(11) 98765-4321',
      academicRegistration: '2023123456789',
      createdAt: '2025-03-24T20:49:45.000Z',
      updatedAt: '2025-03-24T20:49:45.000Z'
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - this student email or academic registry already exists',
    content: {
      'application/json': {
        examples: {
          emailConflict: {
            summary: 'Email already exists',
            value: {
              statusCode: 409,
              message: 'this student email already exists',
              error: 'Conflict'
            }
          },
          academicRegistryConflict: {
            summary: 'Academic registry already exists',
            value: {
              statusCode: 409,
              message: 'this student academic registry already exists',
              error: 'Conflict'
            }
          }
        }
      }
    }
  })
  @Post()
  async create(@Body() data: CreateStudentDTO) {
    return this.studentService.create(data)
  }

  @ApiOperation({ summary: 'Get all students with filters and pagination' })
  @ApiQuery({ name: 'name', required: false, example: 'Alice Oliveira' })
  @ApiQuery({
    name: 'email',
    required: false,
    example: 'alice.oliveira@email.com'
  })
  @ApiQuery({ name: 'ra', required: false, example: '2023123456789' })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['name'],
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
    description: 'List of students with pagination',
    example: {
      total: 1,
      page: 1,
      perPage: 5,
      totalPages: 1,
      data: [
        {
          id: 1,
          name: 'Alice Oliveira',
          email: 'alice.oliveira@email.com',
          phone: '(11) 98765-4321',
          academicRegistration: '2023123456789'
        }
      ]
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @Get()
  async findAll(@Query() filters: FiltersQueryStudentDTO) {
    return this.studentService.findAll(filters)
  }

  @ApiOperation({
    summary: 'Get a single student with their detailed information'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Student ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description:
      'Successful response with all the detailed information of the student and his active loan (if he has a loan)',
    examples: {
      'student-without-loan': {
        summary: 'Response when the student does not have an active loan',
        value: {
          id: 1,
          name: 'Alice Oliveira',
          email: 'alice.oliveira@email.com',
          phone: '(11) 98765-4321',
          academicRegistration: '2023123456789',
          createdAt: '2025-03-24T20:49:45.000Z',
          updatedAt: '2025-03-24T20:49:45.000Z',
          activeLoan: null
        }
      },
      'student-with-loan': {
        summary: 'Response when the student has an active loan',
        value: {
          id: 1,
          name: 'Alice Oliveira',
          email: 'alice.oliveira@email.com',
          phone: '(11) 98765-4321',
          academicRegistration: '2023123456789',
          createdAt: '2025-03-24T20:49:45.000Z',
          updatedAt: '2025-03-24T20:49:45.000Z',
          activeLoan: {
            id: 1,
            studentId: 1,
            bookId: 1,
            loanDate: '2025-03-25T20:48:16.000Z',
            dueDate: '2025-03-30T00:00:00.000Z',
            isActive: true,
            returnDate: null,
            createdAt: '2025-03-25T20:48:16.000Z',
            updatedAt: '2025-03-25T20:48:16.000Z'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - student id 44 does not exist'
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id)
  }

  @ApiOperation({
    summary: 'Optionally update student fields'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Student ID',
    example: 1
  })
  @ApiBody({
    description: 'Fields to update (optional)',
    type: UpdatePatchStudentDTO,
    examples: {
      example: {
        summary: 'Update email and academic registration',
        value: {
          email: 'alice.oliveira.souza@gmail.com',
          academicRegistration: '2025123456899'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Student successfully updated',
    example: {
      id: 1,
      name: 'Alice Oliveira',
      email: 'alice.oliveira.souza@gmail.com',
      phone: '(11) 98765-4321',
      academicRegistration: '2025123456899',
      createdAt: '2025-03-24T20:49:45.000Z',
      updatedAt: '2025-03-25T20:48:12.000Z'
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - student id 23 does not exist'
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - this student email or academic registry already exists',
    content: {
      'application/json': {
        examples: {
          emailConflict: {
            summary: 'Email already exists',
            value: {
              statusCode: 409,
              message: 'this student email already exists',
              error: 'Conflict'
            }
          },
          academicRegistryConflict: {
            summary: 'Academic registry already exists',
            value: {
              statusCode: 409,
              message: 'this student academic registry already exists',
              error: 'Conflict'
            }
          }
        }
      }
    }
  })
  @Patch(':id')
  async update(
    @Body() data: UpdatePatchStudentDTO,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.studentService.update(data, id)
  }

  @ApiOperation({
    summary: 'Delete a single student'
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Student ID',
    example: 1
  })
  @ApiResponse({
    status: 204,
    description: 'Student successfully deleted'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - this student still has active loans and cannot be deleted.'
  })
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.delete(id)
  }
}
