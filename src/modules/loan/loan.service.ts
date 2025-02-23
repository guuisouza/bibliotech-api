import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLoanDTO } from './dto/create-loan.dto'
import { StudentService } from '../student/student.service'
import { BookService } from '../book/book.service'

@Injectable()
export class LoanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentService: StudentService,
    private readonly bookService: BookService
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

    const availableBook = await this.bookService.findOne(data.bookId)
    if (availableBook.available === false) {
      throw new ConflictException('this book is already rented')
    }

    const activeLoan = await this.prisma.loan.findFirst({
      where: {
        studentId: data.studentId,
        isActive: true
      }
    })

    if (activeLoan) {
      throw new ConflictException('this student already has an active loan')
    }

    await this.bookService.setBookAvailability(data.bookId)

    return this.prisma.loan.create({
      data: {
        studentId: data.studentId,
        bookId: data.bookId,
        dueDate: dueDate
      }
    })
  }

  async findAll() {
    return this.prisma.loan.findMany({
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

    await this.prisma.book.update({
      where: { id: loan.bookId },
      data: { available: true }
    })
  }

  async delete(id: number) {
    await this.checkIfLoanExists(id)

    await this.prisma.loan.delete({
      where: { id }
    })
  }

  async checkIfLoanExists(id: number) {
    if (!(await this.prisma.loan.count({ where: { id } }))) {
      throw new NotFoundException(`loan id ${id} does not exist`)
    }
  }
}
