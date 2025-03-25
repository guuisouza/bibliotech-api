import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateStudentDTO } from './dto/create-student.dto'
import { UpdatePatchStudentDTO } from './dto/update-patch-student.dto'
import { FiltersQueryStudentDTO } from './dto/filters-query-student.dto'
import { LoanService } from '../loan/loan.service'

@Injectable()
export class StudentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => LoanService))
    private readonly loanService: LoanService
  ) {}

  async create(data: CreateStudentDTO) {
    const emailExists = await this.findByEmail(data.email)
    if (emailExists) {
      throw new ConflictException('this student email already exists')
    }

    const raExists = await this.findByAcademicRegistration(
      data.academicRegistration
    )
    if (raExists) {
      throw new ConflictException(
        'this student academic registry already exists'
      )
    }

    return this.prisma.student.create({ data })
  }

  async findAll(filters: FiltersQueryStudentDTO) {
    const { name, email, ra, orderBy, orderDirection, page, perPage } = filters

    const students = await this.prisma.student.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      where: {
        name: name ? { contains: name } : undefined,
        email: email ? { contains: email } : undefined,
        academicRegistration: ra ? { equals: ra } : undefined
      },
      orderBy: orderBy ? { [orderBy]: orderDirection } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        academicRegistration: true
      }
    })

    const total = await this.prisma.student.count({
      where: {
        name: name ? { contains: name } : undefined,
        email: email ? { contains: email } : undefined,
        academicRegistration: ra ? { contains: ra } : undefined
      }
    })

    return {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      data: students
    }
  }

  async findOne(id: number) {
    await this.checkIfStudentExists(id)

    const student = await this.prisma.student.findUnique({
      where: { id }
    })

    const activeLoan = await this.loanService.findActiveLoanByStudentId(id)
    return {
      ...student,
      activeLoan
    }
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
        throw new ConflictException('this student email already exists')
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
        throw new ConflictException(
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

  async delete(id: number) {
    await this.checkIfStudentExists(id)

    const activeLoans = await this.prisma.loan.count({
      where: { studentId: id, isActive: true }
    })

    if (activeLoans > 0) {
      throw new ConflictException(
        'this student still has active loans and cannot be deleted.'
      )
    }

    await this.prisma.student.delete({
      where: { id }
    })
  }

  async checkIfStudentExists(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id }
    })

    if (!student) {
      throw new NotFoundException(`student id ${id} does not exist`)
    }
  }

  async findByEmail(email: string) {
    return this.prisma.student.findUnique({
      where: { email }
    })
  }

  async findByAcademicRegistration(academicRegistration: string) {
    return this.prisma.student.findUnique({
      where: { academicRegistration }
    })
  }
}
