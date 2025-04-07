/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing'
import { StudentService } from '../../src/modules/student/student.service'
import { PrismaService } from '../../src/modules/prisma/prisma.service'
import { mockPrismaService } from '../mocks/prisma.mock'
import { LoanService } from '../../src/modules/loan/loan.service'
import { mockLoanService } from '../mocks/loan-service.mock'
import { CreateStudentDTO } from '../../src/modules/student/dto/create-student.dto'
import { Student } from '@prisma/client'
import { ConflictException, NotFoundException } from '@nestjs/common'
import {
  singleStudentWithActiveLoan,
  studentsListMock
} from '../mocks/student-service.mock'
import { FiltersQueryStudentDTO } from '../../src/modules/student/dto/filters-query-student.dto'
import { UpdatePatchStudentDTO } from '../../src/modules/student/dto/update-patch-student.dto'

describe('Student Service', () => {
  let studentService: StudentService
  let loanService: LoanService
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LoanService, useValue: mockLoanService }
      ]
    }).compile()

    studentService = module.get<StudentService>(StudentService)
    loanService = module.get<LoanService>(LoanService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should validate definition of studentService and prismaService', () => {
    expect(studentService).toBeDefined()
    expect(loanService).toBeDefined()
    expect(prismaService).toBeDefined()
  })

  describe('create', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const createStudentDTO: CreateStudentDTO = {
      name: 'Alice Oliveira',
      email: 'alice.oliveira@email.com',
      phone: '(11) 98765-4321',
      academicRegistration: '2023123456789'
    }

    it('should create a new student successfully when all validations pass', async () => {
      jest.spyOn(studentService, 'findByEmail').mockResolvedValue(null)
      jest
        .spyOn(studentService, 'findByAcademicRegistration')
        .mockResolvedValue(null)
      jest
        .spyOn(prismaService.student, 'create')
        .mockResolvedValue({ ...createStudentDTO } as Student)

      const result = await studentService.create(createStudentDTO)

      expect(result).toEqual(createStudentDTO)
      expect(studentService.findByEmail).toHaveBeenCalledWith(
        createStudentDTO.email
      )
      expect(studentService.findByAcademicRegistration).toHaveBeenCalledWith(
        createStudentDTO.academicRegistration
      )
      expect(prismaService.student.create).toHaveBeenCalledWith({
        data: createStudentDTO
      })
    })

    it('should throw a new ConflictException if student email already exists', async () => {
      jest
        .spyOn(studentService, 'findByEmail')
        .mockResolvedValue({ ...createStudentDTO } as Student)
      jest
        .spyOn(studentService, 'findByAcademicRegistration')
        .mockResolvedValue(null)

      await expect(studentService.create(createStudentDTO)).rejects.toThrow(
        new ConflictException('this student email already exists')
      )

      expect(studentService.findByEmail).toHaveBeenCalledWith(
        createStudentDTO.email
      )
      expect(studentService.findByAcademicRegistration).not.toHaveBeenCalled()
      expect(prismaService.student.create).not.toHaveBeenCalled()
    })

    it('should throw a new ConflictException if student RA already exists', async () => {
      jest.spyOn(studentService, 'findByEmail').mockResolvedValue(null)
      jest
        .spyOn(studentService, 'findByAcademicRegistration')
        .mockResolvedValue({ ...createStudentDTO } as Student)

      await expect(studentService.create(createStudentDTO)).rejects.toThrow(
        new ConflictException('this student academic registry already exists')
      )

      expect(studentService.findByEmail).toHaveBeenCalledWith(
        createStudentDTO.email
      )
      expect(studentService.findByAcademicRegistration).toHaveBeenCalledWith(
        createStudentDTO.academicRegistration
      )
      expect(prismaService.student.create).not.toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    const mockPrismaFindManyAndCount = (data: any[], total: number) => {
      jest.spyOn(prismaService.student, 'findMany').mockResolvedValue(data)
      jest.spyOn(prismaService.student, 'count').mockResolvedValue(total)
    }

    it('should return all students correctly', async () => {
      mockPrismaFindManyAndCount(studentsListMock, studentsListMock.length)
      const filters: FiltersQueryStudentDTO = {
        page: 1,
        perPage: 5
      } as FiltersQueryStudentDTO

      const result = await studentService.findAll(filters)

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('should filter students by name', async () => {
      const filters: FiltersQueryStudentDTO = {
        name: 'Alice Oliveira',
        page: 1,
        perPage: 5
      } as FiltersQueryStudentDTO
      const filteredMock = studentsListMock.filter(
        (b) => b.name === filters.name
      )

      mockPrismaFindManyAndCount(filteredMock, filteredMock.length)

      const result = await studentService.findAll(filters)

      expect(result.data).toHaveLength(1)
      expect(result.data[0].name).toBe('Alice Oliveira')
      expect(result.total).toBe(1)
    })

    it('should filter students by email', async () => {
      const filters: FiltersQueryStudentDTO = {
        email: 'alice.oliveira@email.com',
        page: 1,
        perPage: 5
      } as FiltersQueryStudentDTO
      const filteredMock = studentsListMock.filter(
        (b) => b.email === filters.email
      )

      mockPrismaFindManyAndCount(filteredMock, filteredMock.length)

      const result = await studentService.findAll(filters)

      expect(result.data).toHaveLength(1)
      expect(result.data[0].email).toBe('alice.oliveira@email.com')
      expect(result.total).toBe(1)
    })

    it('should filter students by academic registration', async () => {
      const filters: FiltersQueryStudentDTO = {
        ra: '2023123456789',
        page: 1,
        perPage: 5
      } as FiltersQueryStudentDTO
      const filteredMock = studentsListMock.filter(
        (b) => b.academicRegistration === filters.ra
      )

      mockPrismaFindManyAndCount(filteredMock, filteredMock.length)

      const result = await studentService.findAll(filters)

      expect(result.data).toHaveLength(1)
      expect(result.data[0].academicRegistration).toBe('2023123456789')
      expect(result.total).toBe(1)
    })

    it('should return paginated students correctly', async () => {
      const filters: FiltersQueryStudentDTO = {
        page: 2,
        perPage: 1
      } as FiltersQueryStudentDTO
      const paginatedMock = [studentsListMock[1]]

      mockPrismaFindManyAndCount(paginatedMock, studentsListMock.length)

      const result = await studentService.findAll(filters)

      expect(result.page).toBe(2)
      expect(result.perPage).toBe(1)
      expect(result.totalPages).toBe(2)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].name).toBe('Bruno Santos')
    })

    it('should order students by name', async () => {
      const filters: FiltersQueryStudentDTO = {
        orderBy: 'name',
        orderDirection: 'asc',
        page: 1,
        perPage: 5
      }

      const orderedMock = [...studentsListMock].sort((a, b) =>
        a.name.localeCompare(b.name)
      )

      mockPrismaFindManyAndCount(orderedMock, orderedMock.length)
      const result = await studentService.findAll(filters)

      expect(result.data[0].name).toBe('Alice Oliveira')
      expect(result.data[1].name).toBe('Bruno Santos')
    })
  })

  describe('findOne', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const studentId = 1

    const studentActiveLoan = {
      id: 1,
      studentId: 1,
      bookId: 1,
      loanDate: '2025-03-25T20:48:16.000Z',
      dueDate: '2025-04-30T00:00:00.000Z',
      isActive: true,
      returnDate: null,
      createdAt: '2025-03-25T20:48:16.000Z',
      updatedAt: '2025-04-25T20:48:16.000Z'
    }

    it('should return a single student with its active loan', async () => {
      jest
        .spyOn(studentService, 'checkIfStudentExists')
        .mockResolvedValue(undefined)
      jest
        .spyOn(prismaService.student, 'findUnique')
        .mockResolvedValue(singleStudentWithActiveLoan as any)
      jest
        .spyOn(loanService, 'findActiveLoanByStudentId')
        .mockResolvedValue(studentActiveLoan as any)

      const result = await studentService.findOne(studentId)

      expect(studentService.checkIfStudentExists).toHaveBeenCalledWith(
        studentId
      )
      expect(loanService.findActiveLoanByStudentId).toHaveBeenCalledWith(
        studentId
      )
      expect(prismaService.student.findUnique).toHaveBeenCalledWith({
        where: { id: studentId }
      })

      expect(result).toEqual(singleStudentWithActiveLoan)
    })

    it('should throw NotFoundException if student does not exist', async () => {
      const nonExistentId = 45
      jest
        .spyOn(studentService, 'checkIfStudentExists')
        .mockRejectedValue(new NotFoundException())

      await expect(studentService.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException
      )

      expect(studentService.checkIfStudentExists).toHaveBeenCalledWith(
        nonExistentId
      )
      expect(prismaService.book.findUnique).not.toHaveBeenCalled()
    })
  })

  describe('update', () => {
    const studentId = 1

    const updateData: UpdatePatchStudentDTO = {
      name: 'Alice Oliveira dos Santos',
      email: 'alice.oliveirasantos@email.com',
      academicRegistration: '2023123456987',
      updatedAt: new Date()
    }

    const expectedUpdatedStudent = {
      ...studentsListMock[0],
      ...updateData
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should update the student with provided fields and return the updated student', async () => {
      jest
        .spyOn(studentService, 'checkIfStudentExists')
        .mockResolvedValue(undefined)
      jest.spyOn(studentService, 'findByEmail').mockResolvedValue(null)
      jest
        .spyOn(studentService, 'findByAcademicRegistration')
        .mockResolvedValue(null)
      jest
        .spyOn(prismaService.student, 'update')
        .mockResolvedValue(expectedUpdatedStudent as Student)

      const result = await studentService.update(updateData, studentId)
      expect(studentService.checkIfStudentExists).toHaveBeenCalledWith(
        studentId
      )
      expect(studentService.findByEmail).toHaveBeenCalledWith(updateData.email)
      expect(studentService.findByAcademicRegistration).toHaveBeenCalledWith(
        updateData.academicRegistration
      )
      expect(prismaService.student.update).toHaveBeenCalledWith({
        where: { id: studentId },
        data: {
          ...updateData,
          updatedAt: expect.any(String)
        }
      })
      expect(result).toEqual(expectedUpdatedStudent)
    })

    it('should throw NotFoundException if student does not exist', async () => {
      const nonExistentId = 45
      jest
        .spyOn(studentService, 'checkIfStudentExists')
        .mockRejectedValue(new NotFoundException())
      jest.spyOn(studentService, 'findByEmail').mockResolvedValue(null)
      jest
        .spyOn(studentService, 'findByAcademicRegistration')
        .mockResolvedValue(null)
      jest
        .spyOn(prismaService.student, 'update')
        .mockResolvedValue(expectedUpdatedStudent as Student)

      await expect(
        studentService.update(updateData, nonExistentId)
      ).rejects.toThrow(NotFoundException)

      expect(studentService.checkIfStudentExists).toHaveBeenCalledWith(
        nonExistentId
      )
      expect(studentService.findByEmail).not.toHaveBeenCalled()
      expect(studentService.findByAcademicRegistration).not.toHaveBeenCalled()
      expect(prismaService.student.update).not.toHaveBeenCalled()
    })

    it('should throw ConflictException if student email alredy exists', async () => {
      jest
        .spyOn(studentService, 'checkIfStudentExists')
        .mockResolvedValue(undefined)
      jest
        .spyOn(studentService, 'findByEmail')
        .mockResolvedValue(studentsListMock[1] as Student)

      const updateData: UpdatePatchStudentDTO = {
        email: studentsListMock[1].email,
        updatedAt: new Date()
      }

      await expect(
        studentService.update(updateData, studentId)
      ).rejects.toThrow(
        new ConflictException('this student email already exists')
      )

      expect(studentService.findByEmail).toHaveBeenCalledWith(updateData.email)
      expect(prismaService.student.update).not.toHaveBeenCalled()
    })

    it('should throw ConflictException if student RA alredy exists', async () => {
      jest
        .spyOn(studentService, 'checkIfStudentExists')
        .mockResolvedValue(undefined)
      jest.spyOn(studentService, 'findByEmail').mockResolvedValue(null)
      jest
        .spyOn(studentService, 'findByAcademicRegistration')
        .mockResolvedValue(studentsListMock[1] as Student)

      const updateData: UpdatePatchStudentDTO = {
        academicRegistration: studentsListMock[1].academicRegistration,
        updatedAt: new Date()
      }

      await expect(
        studentService.update(updateData, studentId)
      ).rejects.toThrow(
        new ConflictException('this student academic registry already exists')
      )

      expect(studentService.findByEmail).not.toHaveBeenCalled()
      expect(studentService.findByAcademicRegistration).toHaveBeenCalledWith(
        updateData.academicRegistration
      )
      expect(prismaService.student.update).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it.skip('should delete a single student successfully', async () => {})
    it.skip('should throw ConflictException if student still has active loans', async () => {})
  })

  describe('checkIfStudentExists', () => {
    const studentId = 1

    it('should not throw if student exists', async () => {
      jest
        .spyOn(prismaService.student, 'findUnique')
        .mockResolvedValue({ id: studentId } as Student)

      await expect(
        studentService.checkIfStudentExists(studentId)
      ).resolves.not.toThrow()
      expect(prismaService.student.findUnique).toHaveBeenCalledWith({
        where: { id: studentId }
      })
    })

    it('should throw NotFoundException if student does not exist', async () => {
      jest.spyOn(prismaService.student, 'findUnique').mockResolvedValue(null)

      await expect(
        studentService.checkIfStudentExists(studentId)
      ).rejects.toThrow(
        new NotFoundException(`student id ${studentId} does not exist`)
      )

      expect(prismaService.student.findUnique).toHaveBeenCalledWith({
        where: { id: studentId }
      })
    })
  })

  describe('findByEmail', () => {
    it('should return a student when email exists', async () => {
      jest
        .spyOn(prismaService.student, 'findUnique')
        .mockResolvedValue(studentsListMock[0] as Student)

      const result = await studentService.findByEmail(studentsListMock[0].email)

      expect(prismaService.student.findUnique).toHaveBeenCalledWith({
        where: {
          email: studentsListMock[0].email
        }
      })
      expect(result).toEqual(studentsListMock[0])
    })

    it('should return null when student with the given email does not exist', async () => {
      jest.spyOn(prismaService.student, 'findUnique').mockResolvedValue(null)

      const nonExistentEmail = 'abctest@test.com'
      const result = await studentService.findByEmail(nonExistentEmail)

      expect(prismaService.student.findUnique).toHaveBeenCalledWith({
        where: {
          email: nonExistentEmail
        }
      })
      expect(result).toBeNull()
    })
  })

  describe('findByAcademicRegistration', () => {
    it('should return a student when RA exists', async () => {
      jest
        .spyOn(prismaService.student, 'findUnique')
        .mockResolvedValue(studentsListMock[0] as Student)

      const result = await studentService.findByAcademicRegistration(
        studentsListMock[0].academicRegistration
      )

      expect(prismaService.student.findUnique).toHaveBeenCalledWith({
        where: {
          academicRegistration: studentsListMock[0].academicRegistration
        }
      })
      expect(result).toEqual(studentsListMock[0])
    })

    it('should return null when student with the given RA does not exist', async () => {
      jest.spyOn(prismaService.student, 'findUnique').mockResolvedValue(null)

      const nonExistentRA = '2022987654111'
      const result = await studentService.findByEmail(nonExistentRA)

      expect(prismaService.student.findUnique).toHaveBeenCalledWith({
        where: {
          email: nonExistentRA
        }
      })
      expect(result).toBeNull()
    })
  })
})
