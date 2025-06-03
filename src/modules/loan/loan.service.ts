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

    return this.prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id: data.bookId } })
      if (!book) throw new NotFoundException(`book id ${data.bookId} not found`)

      if (book.availableQuantity <= 0) {
        throw new ConflictException('no available copies of this book')
      }

      const activeLoan = await tx.loan.findFirst({
        where: {
          studentId: data.studentId,
          isActive: true
        }
      })

      if (activeLoan) {
        throw new ConflictException('This student already has an active loan')
      }

      const newLoan = await tx.loan.create({
        data: {
          studentId: data.studentId,
          bookId: data.bookId,
          dueDate
        }
      })

      await tx.book.update({
        where: { id: data.bookId },
        data: {
          availableQuantity: { decrement: 1 }
        }
      })

      return newLoan
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
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id } })
      if (!loan) throw new NotFoundException('Loan not found')

      if (!loan.isActive) {
        throw new ConflictException('This loan has already been returned')
      }

      const returnedLoan = await tx.loan.update({
        where: { id },
        data: {
          isActive: false,
          returnDate: new Date(),
          updatedAt: new Date()
        },
        select: {
          id: true,
          returnDate: true,
          isActive: true,
          book: {
            select: {
              id: true,
              title: true
            }
          },
          student: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      await tx.book.update({
        where: { id: loan.bookId },
        data: {
          availableQuantity: { increment: 1 }
        }
      })

      return returnedLoan
    })
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
