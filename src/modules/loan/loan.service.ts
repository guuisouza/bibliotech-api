import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLoanDTO } from './dto/create-loan.dto'
import { StudentService } from '../student/student.service'
import { BookService } from '../book/book.service'
import { FiltersQueryLoanDTO } from './dto/filters-query-loan.dto'

@Injectable()
export class LoanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookService: BookService,
    @Inject(forwardRef(() => StudentService))
    private readonly studentService: StudentService
  ) {}

  async create(data: CreateLoanDTO) {
    const dueDate = new Date(data.dueDate)
    if (dueDate <= new Date()) {
      throw new BadRequestException(
        'loan date must be greater than current date'
      )
    }

    await this.studentService.checkIfStudentExists(data.studentId)

    await this.bookService.checkIfBookExists(data.bookId)

    await this.bookService.checkIfBookIsRented(data.bookId)

    const activeLoan = await this.prisma.loan.findFirst({
      where: {
        studentId: data.studentId,
        isActive: true
      }
    })

    if (activeLoan) {
      throw new ConflictException('this student already has an active loan')
    }

    await this.bookService.setBookAvailability(data.bookId, false)

    return this.prisma.loan.create({
      data: {
        studentId: data.studentId,
        bookId: data.bookId,
        dueDate: dueDate
      }
    })
  }

  async findAll(filters: FiltersQueryLoanDTO) {
    const {
      studentId,
      bookId,
      loanDateStart,
      loanDateLimit,
      isActive,
      orderBy,
      orderDirection,
      page,
      perPage
    } = filters

    const loans = await this.prisma.loan.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      where: {
        studentId: studentId ? { equals: studentId } : undefined,
        bookId: bookId ? { equals: bookId } : undefined,
        loanDate: {
          gte: loanDateStart ? new Date(loanDateStart) : undefined,
          lte: loanDateLimit ? new Date(loanDateLimit) : undefined
        },
        isActive
      },
      orderBy: orderBy ? { [orderBy]: orderDirection } : undefined,
      select: {
        id: true,
        loanDate: true,
        dueDate: true,
        isActive: true,
        student: {
          select: {
            name: true,
            academicRegistration: true
          }
        },
        book: {
          select: {
            title: true
          }
        }
      }
    })

    const total = await this.prisma.loan.count({
      where: {
        studentId: studentId ? { equals: studentId } : undefined,
        bookId: bookId ? { equals: bookId } : undefined,
        loanDate: {
          gte: loanDateStart ? new Date(loanDateStart) : undefined,
          lte: loanDateLimit ? new Date(loanDateLimit) : undefined
        },
        isActive
      }
    })

    return {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      data: loans
    }
  }

  async findOne(id: number) {
    await this.checkIfLoanExists(id)

    return this.prisma.loan.findUnique({
      where: { id },
      select: {
        id: true,
        loanDate: true,
        dueDate: true,
        isActive: true,
        returnDate: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            academicRegistration: true
          }
        },
        book: {
          select: {
            id: true,
            title: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    })
  }

  async closeLoan(id: number) {
    await this.checkIfLoanExists(id)

    const loan = await this.prisma.loan.findUnique({
      where: { id }
    })

    if (!loan.isActive) {
      throw new ConflictException('this loan has already been returned')
    }

    await this.prisma.loan.update({
      where: { id },
      data: {
        isActive: false,
        returnDate: new Date(),
        updatedAt: new Date()
      }
    })
    await this.bookService.setBookAvailability(loan.bookId, true)
  }

  async delete(id: number) {
    await this.checkIfLoanExists(id)

    const activeLoan = await this.prisma.loan.findUnique({
      where: {
        id,
        isActive: true
      }
    })

    if (activeLoan) {
      throw new ConflictException('this loan is active and cannot be deleted')
    }

    await this.prisma.loan.delete({
      where: { id }
    })
  }

  async checkIfLoanExists(id: number) {
    const loan = await this.prisma.loan.findUnique({
      where: {
        id
      }
    })

    if (!loan) {
      throw new NotFoundException(`loan id ${id} does not exist`)
    }
  }

  async findActiveLoanByStudentId(studentId: number) {
    return this.prisma.loan.findFirst({
      where: {
        studentId,
        isActive: true
      }
    })
  }
}
