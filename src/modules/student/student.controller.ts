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
import { StudentService } from './student.service'
import { CreateStudentDTO } from './dto/create-student.dto'
import { UpdatePatchStudentDTO } from './dto/update-patch-student.dto'

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  async create(@Body() data: CreateStudentDTO) {
    return this.studentService.create(data)
  }

  @Get()
  async findAll() {
    return this.studentService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id)
  }

  @Patch(':id')
  async update(
    @Body() data: UpdatePatchStudentDTO,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.studentService.update(data, id)
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.delete(id)
  }
}
