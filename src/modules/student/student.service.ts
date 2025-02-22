import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateStudentDTO } from './dto/create-student.dto'
import { UpdatePatchStudentDTO } from './dto/update-patch-student.dto'

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateStudentDTO) {
    const emailExists = await this.findByEmail(data.email)
    if (emailExists) {
      throw new BadRequestException('this student email already exists')
    }

    const raExists = await this.findByAcademicRegistration(
      data.academicRegistration
    )
    if (raExists) {
      throw new BadRequestException(
        'this student academic registry already exists'
      )
    }

    return this.prisma.student.create({ data })
  }

  async findAll() {
    const students = await this.prisma.student.findMany()

    return students
  }

  async findOne(id: number) {
    await this.checkIfStudentExists(id)

    return this.prisma.student.findUnique({
      where: { id }
    })
  }

  async update(data: UpdatePatchStudentDTO, id: number) {
    await this.checkIfStudentExists(id)

    const dataToUpdate = {}

    if (data.name && data.name.trim() !== '') {
      dataToUpdate['name'] = data.name
    }

    if (data.email && data.email.trim() !== '') {
      const emailExists = await this.findByEmail(data.email)
      if (emailExists) {
        throw new BadRequestException('this student email already exists')
      }
      dataToUpdate['email'] = data.email
    }

    if (data.phone && data.phone.trim() !== '') {
      dataToUpdate['phone'] = data.phone
    }

    if (data.academicRegistration && data.academicRegistration.trim() !== '') {
      const raExists = await this.findByAcademicRegistration(
        data.academicRegistration
      )
      if (raExists) {
        throw new BadRequestException(
          'this student academic registry already exists'
        )
      }

      dataToUpdate['academicRegistration'] = data.academicRegistration
    }

    if (
      Object.keys(dataToUpdate).some(
        (key) => dataToUpdate[key] !== undefined && dataToUpdate[key] !== null
      )
    ) {
      dataToUpdate['updatedAt'] = new Date(Date.now()).toISOString()
    }

    return this.prisma.student.update({ where: { id }, data: dataToUpdate })
  }

  async checkIfStudentExists(id: number) {
    if (!(await this.prisma.student.count({ where: { id } }))) {
      throw new NotFoundException(`student id ${id} does not exist`)
    }
  }

  async findByEmail(email: string) {
    return this.prisma.student.count({
      where: { email }
    })
  }

  async findByAcademicRegistration(academicRegistration: string) {
    return this.prisma.student.count({
      where: { academicRegistration }
    })
  }
}
