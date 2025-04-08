/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing'
import { LoanService } from '../../src/modules/loan/loan.service'
import { PrismaService } from '../../src/modules/prisma/prisma.service'
import { BookService } from '../../src/modules/book/book.service'
import { StudentService } from '../../src/modules/student/student.service'
import { mockBookService } from '../mocks/book-service.mock'
import { mockPrismaService } from '../mocks/prisma.mock'
import { mockStudentService } from '../mocks/student-service.mock'
import { CreateLoanDTO } from '../../src/modules/loan/dto/create-loan.dto'
import {
  BadRequestException,
  ConflictException,
  NotFoundException
} from '@nestjs/common'
import { Loan } from '@prisma/client'
import {
  activeLoanMock,
  inactiveLoanMock,
  loansListMock,
  mockLoanExists,
  mockLoanWithSelect
} from '../mocks/loan-service.mock'
import { FiltersQueryLoanDTO } from '../../src/modules/loan/dto/filters-query-loan.dto'

describe('Loan Service', () => {
  let loanService: LoanService
  let bookService: BookService
  let studentService: StudentService
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: BookService, useValue: mockBookService },
        { provide: StudentService, useValue: mockStudentService }
      ]
    }).compile()

    loanService = module.get<LoanService>(LoanService)
    bookService = module.get<BookService>(BookService)
    studentService = module.get<StudentService>(StudentService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should validate definition of loanService, bookService, studentService and prismaService', () => {
    expect(loanService).toBeDefined()
    expect(bookService).toBeDefined()
    expect(studentService).toBeDefined()
    expect(prismaService).toBeDefined()
  })

  describe('create', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const createLoanDTO: CreateLoanDTO = {
      studentId: 1,
      bookId: 1,
      dueDate: new Date('2025-04-21')
    }

    it('should create a new loan successfully when all validations pass', async () => {
      jest
        .spyOn(studentService, 'checkIfStudentExists')
        .mockResolvedValue(undefined)

      jest.spyOn(bookService, 'checkIfBookExists').mockResolvedValue(undefined)

      jest
        .spyOn(bookService, 'checkIfBookIsRented')
        .mockResolvedValue(undefined)

      jest.spyOn(prismaService.loan, 'findFirst').mockResolvedValue(null)

      jest
        .spyOn(bookService, 'setBookAvailability')
        .mockResolvedValue(undefined)

      const createdLoanMock = {
        id: 1,
        ...createLoanDTO,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      jest
        .spyOn(prismaService.loan, 'create')
        .mockResolvedValue(createdLoanMock as Loan)

      const result = await loanService.create(createLoanDTO)

      expect(studentService.checkIfStudentExists).toHaveBeenCalledWith(1)
      expect(bookService.checkIfBookExists).toHaveBeenCalledWith(1)
      expect(bookService.checkIfBookIsRented).toHaveBeenCalledWith(1)
      expect(prismaService.loan.findFirst).toHaveBeenCalledWith({
        where: {
          studentId: 1,
          isActive: true
        }
      })
      expect(bookService.setBookAvailability).toHaveBeenCalledWith(1, false)
      expect(prismaService.loan.create).toHaveBeenCalledWith({
        data: {
          studentId: 1,
          bookId: 1,
          dueDate: new Date('2025-04-21')
        }
      })
      expect(result).toEqual(createdLoanMock)
    })

    it('should throw BadRequestException if due date is less than current date', async () => {
      const pastDateDTO = {
        ...createLoanDTO,
        dueDate: new Date('2020-01-01')
      }

      await expect(loanService.create(pastDateDTO)).rejects.toThrow(
        new BadRequestException('loan date must be greater than current date')
      )
    })

    it('should throw NotFoundException if student does not exist', async () => {
      jest
        .spyOn(studentService, 'checkIfStudentExists')
        .mockRejectedValue(
          new NotFoundException(
            `student id ${createLoanDTO.studentId} does not exist`
          )
        )

      await expect(loanService.create(createLoanDTO)).rejects.toThrow(
        new NotFoundException(
          `student id ${createLoanDTO.studentId} does not exist`
        )
      )
    })

    it('should throw NotFoundException if book does not exist', async () => {
      jest
        .spyOn(studentService, 'checkIfStudentExists')
        .mockResolvedValue(undefined)

      jest
        .spyOn(bookService, 'checkIfBookExists')
        .mockRejectedValue(
          new NotFoundException(
            `book id ${createLoanDTO.bookId} does not exist`
          )
        )

      await expect(loanService.create(createLoanDTO)).rejects.toThrow(
        new NotFoundException(`book id ${createLoanDTO.bookId} does not exist`)
      )
    })

    it('should throw ConflictException if book is already rented', async () => {
      jest
        .spyOn(studentService, 'checkIfStudentExists')
        .mockResolvedValue(undefined)

      jest.spyOn(bookService, 'checkIfBookExists').mockResolvedValue(undefined)

      jest
        .spyOn(bookService, 'checkIfBookIsRented')
        .mockRejectedValue(new ConflictException('this book is already rented'))

      await expect(loanService.create(createLoanDTO)).rejects.toThrow(
        new ConflictException('this book is already rented')
      )
    })

    it('should throw ConflictException if student already has an active loan', async () => {
      const createdLoanMock = {
        id: 1,
        ...createLoanDTO,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      jest
        .spyOn(studentService, 'checkIfStudentExists')
        .mockResolvedValue(undefined)

      jest.spyOn(bookService, 'checkIfBookExists').mockResolvedValue(undefined)

      jest
        .spyOn(bookService, 'checkIfBookIsRented')
        .mockResolvedValue(undefined)

      jest
        .spyOn(prismaService.loan, 'findFirst')
        .mockResolvedValue(createdLoanMock as Loan)

      await expect(loanService.create(createLoanDTO)).rejects.toThrow(
        new ConflictException('this student already has an active loan')
      )
    })
  })

  describe('findAll', () => {
    const mockPrismaFindManyAndCount = (data: any[], total: number) => {
      jest.spyOn(prismaService.loan, 'findMany').mockResolvedValue(data)
      jest.spyOn(prismaService.loan, 'count').mockResolvedValue(total)
    }

    it('should return all loans correctly', async () => {
      mockPrismaFindManyAndCount(loansListMock, loansListMock.length)
      const filters: FiltersQueryLoanDTO = {
        page: 1,
        perPage: 5
      } as FiltersQueryLoanDTO

      const result = await loanService.findAll(filters)

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('should filter loans by studentId', async () => {
      const filters: FiltersQueryLoanDTO = {
        studentId: 1,
        page: 1,
        perPage: 5
      } as FiltersQueryLoanDTO

      const filteredMock = loansListMock.filter(
        (l) => l.id === filters.studentId
      )

      mockPrismaFindManyAndCount(filteredMock, filteredMock.length)

      const result = await loanService.findAll(filters)

      expect(result.data).toHaveLength(1)
      expect(result.data[0].student.name).toBe('Alice Oliveira')
      expect(result.total).toBe(1)
    })

    it('should filter loans by bookId', async () => {
      const filters: FiltersQueryLoanDTO = {
        bookId: 2,
        page: 1,
        perPage: 5
      } as FiltersQueryLoanDTO

      const filteredMock = loansListMock.filter((l) => l.id === filters.bookId)

      mockPrismaFindManyAndCount(filteredMock, filteredMock.length)

      const result = await loanService.findAll(filters)

      expect(result.data).toHaveLength(1)
      expect(result.data[0].book.title).toBe('1984')
      expect(result.total).toBe(1)
    })

    it('should filter loans by isActive', async () => {
      const filters: FiltersQueryLoanDTO = {
        isActive: false,
        page: 1,
        perPage: 5
      } as FiltersQueryLoanDTO

      const filteredMock = loansListMock.filter((l) => l.isActive === false)

      mockPrismaFindManyAndCount(filteredMock, filteredMock.length)

      const result = await loanService.findAll(filters)

      expect(result.data).toHaveLength(1)
      expect(result.data[0].isActive).toBe(false)
      expect(result.total).toBe(1)
    })

    it('should return paginated loans correctly', async () => {
      const filters: FiltersQueryLoanDTO = {
        page: 2,
        perPage: 1
      } as FiltersQueryLoanDTO

      const paginatedMock = [loansListMock[1]]

      mockPrismaFindManyAndCount(paginatedMock, loansListMock.length)

      const result = await loanService.findAll(filters)

      expect(result.page).toBe(2)
      expect(result.perPage).toBe(1)
      expect(result.totalPages).toBe(2)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].student.name).toBe('Bruno Santos')
    })

    it('should order loans by loanDate asc', async () => {
      const filters: FiltersQueryLoanDTO = {
        orderBy: 'loanDate',
        orderDirection: 'asc',
        page: 1,
        perPage: 5
      }

      const orderedMock = [...loansListMock].sort(
        (a, b) =>
          new Date(a.loanDate).getTime() - new Date(b.loanDate).getTime()
      )

      mockPrismaFindManyAndCount(orderedMock, orderedMock.length)

      const result = await loanService.findAll(filters)

      expect(result.data[0].loanDate).toBe(orderedMock[0].loanDate)
      expect(result.data[1].loanDate).toBe(orderedMock[1].loanDate)
    })
  })

  describe('findOne', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const loanId = 1

    it('should return a loan with student and book data', async () => {
      jest.spyOn(loanService, 'checkIfLoanExists').mockResolvedValue(undefined)
      jest
        .spyOn(prismaService.loan, 'findUnique')
        .mockResolvedValue(mockLoanWithSelect as any)

      const result = await loanService.findOne(loanId)

      expect(loanService.checkIfLoanExists).toHaveBeenCalledWith(loanId)
      expect(prismaService.loan.findUnique).toHaveBeenCalledWith({
        where: { id: loanId },
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
      expect(result).toEqual(mockLoanWithSelect)
    })

    it('should throw NotFoundException if loan does not exist', async () => {
      const nonExistentId = 4444
      jest
        .spyOn(loanService, 'checkIfLoanExists')
        .mockRejectedValue(new NotFoundException())
      await expect(loanService.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException
      )
      expect(loanService.checkIfLoanExists).toHaveBeenCalledWith(nonExistentId)
      expect(prismaService.loan.findUnique).not.toHaveBeenCalled()
    })
  })

  describe('closeLoan', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should close an active loan successfully', async () => {
      jest.spyOn(loanService, 'checkIfLoanExists').mockResolvedValue(undefined)
      jest
        .spyOn(prismaService.loan, 'findUnique')
        .mockResolvedValue(activeLoanMock as Loan)
      jest.spyOn(prismaService.loan, 'update').mockResolvedValue({} as Loan)
      jest
        .spyOn(bookService, 'setBookAvailability')
        .mockResolvedValue(undefined)

      await loanService.closeLoan(activeLoanMock.id)

      expect(prismaService.loan.update).toHaveBeenCalledWith({
        where: { id: activeLoanMock.id },
        data: {
          isActive: false,
          returnDate: expect.any(Date),
          updatedAt: expect.any(Date)
        }
      })

      expect(bookService.setBookAvailability).toHaveBeenCalledWith(
        activeLoanMock.bookId,
        true
      )
    })

    it('should throw NotFoundException if loan does not exist', async () => {
      const nonExistentId = 4444
      jest
        .spyOn(loanService, 'checkIfLoanExists')
        .mockRejectedValue(new NotFoundException())
      await expect(loanService.closeLoan(nonExistentId)).rejects.toThrow(
        NotFoundException
      )
      expect(loanService.checkIfLoanExists).toHaveBeenCalledWith(nonExistentId)
      expect(prismaService.loan.findUnique).not.toHaveBeenCalled()
      expect(prismaService.loan.update).not.toHaveBeenCalled()
      expect(bookService.setBookAvailability).not.toHaveBeenCalled()
    })

    it('should throw ConflictException if loan has already been returned', async () => {
      jest.spyOn(loanService, 'checkIfLoanExists').mockResolvedValue(undefined)

      jest
        .spyOn(prismaService.loan, 'findUnique')
        .mockResolvedValue(inactiveLoanMock as Loan)

      await expect(loanService.closeLoan(inactiveLoanMock.id)).rejects.toThrow(
        new ConflictException('this loan has already been returned')
      )
    })
  })

  describe('delete', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const loanId = 1

    it('should delete an inactive loan successfully', async () => {
      jest.spyOn(loanService, 'checkIfLoanExists').mockResolvedValue(undefined)
      jest.spyOn(prismaService.loan, 'findUnique').mockResolvedValue(undefined)
      jest.spyOn(prismaService.loan, 'delete').mockResolvedValue(undefined)

      await expect(loanService.delete(loanId)).resolves.toBeUndefined()

      expect(prismaService.loan.delete).toHaveBeenCalledWith({
        where: { id: loanId }
      })
    })

    it('should throw ConflictException if the loan is active', async () => {
      jest.spyOn(loanService, 'checkIfLoanExists').mockResolvedValue(undefined)
      jest
        .spyOn(prismaService.loan, 'findUnique')
        .mockResolvedValue(activeLoanMock as Loan)

      await expect(loanService.delete(loanId)).rejects.toThrow(
        ConflictException
      )

      expect(prismaService.loan.delete).not.toHaveBeenCalled()
    })

    it('should throw NotFoundException if loan does not exist', async () => {
      const nonExistentId = 444
      jest
        .spyOn(loanService, 'checkIfLoanExists')
        .mockRejectedValue(new NotFoundException())
      await expect(loanService.delete(nonExistentId)).rejects.toThrow(
        NotFoundException
      )

      expect(prismaService.loan.findUnique).not.toHaveBeenCalled()
      expect(prismaService.loan.delete).not.toHaveBeenCalled()
    })
  })

  describe('checkIfLoanExists', () => {
    const loanId = 1

    it('should not throw if loan exists', async () => {
      jest
        .spyOn(prismaService.loan, 'findUnique')
        .mockResolvedValue({ id: loanId } as any)

      await expect(loanService.checkIfLoanExists(loanId)).resolves.not.toThrow()

      expect(prismaService.loan.findUnique).toHaveBeenCalledWith({
        where: { id: loanId }
      })
    })

    it('should throw NotFoundException if loan does not exist', async () => {
      jest.spyOn(prismaService.loan, 'findUnique').mockResolvedValue(null)

      await expect(loanService.checkIfLoanExists(loanId)).rejects.toThrow(
        new NotFoundException(`loan id ${loanId} does not exist`)
      )

      expect(prismaService.loan.findUnique).toHaveBeenCalledWith({
        where: { id: loanId }
      })
    })
  })

  describe('findActiveLoanByStudentId', () => {
    it('should return an active loan for the student if one exists', async () => {
      const studentId = 1
      jest
        .spyOn(prismaService.loan, 'findFirst')
        .mockResolvedValue(mockLoanExists as Loan)

      const result = await loanService.findActiveLoanByStudentId(studentId)

      expect(result).toEqual(mockLoanExists)
      expect(prismaService.loan.findFirst).toHaveBeenCalledWith({
        where: {
          studentId,
          isActive: true
        }
      })
    })

    it('should return null if the student has no active loan', async () => {
      const studentId = 999

      jest.spyOn(prismaService.loan, 'findFirst').mockResolvedValue(null)

      const result = await loanService.findActiveLoanByStudentId(studentId)

      expect(result).toBeNull()
      expect(prismaService.loan.findFirst).toHaveBeenCalledWith({
        where: {
          studentId,
          isActive: true
        }
      })
    })
  })
})
