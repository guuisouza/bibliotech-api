import { Test, TestingModule } from '@nestjs/testing'
import { JwtAuthGuard } from '../../src/guards/jwt-auth-guard'
import { jwtAuthGuardMock } from '../mocks/jwt-auth-guard.mock'
import { StudentController } from '../../src/modules/student/student.controller'
import { StudentService } from '../../src/modules/student/student.service'
import { CreateStudentDTO } from '../../src/modules/student/dto/create-student.dto'
import {
  mockStudentService,
  singleStudentWithActiveLoan,
  studentsListMock
} from '../mocks/student-service.mock'
import { FiltersQueryStudentDTO } from '../../src/modules/student/dto/filters-query-student.dto'
import { UpdatePatchStudentDTO } from '../../src/modules/student/dto/update-patch-student.dto'

describe('StudentController', () => {
  let studentController: StudentController
  let studentService: StudentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [{ provide: StudentService, useValue: mockStudentService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtAuthGuardMock)
      .compile()

    studentController = module.get<StudentController>(StudentController)
    studentService = module.get<StudentService>(StudentService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(studentController).toBeDefined()
    expect(studentService).toBeDefined()
  })

  it('should check if the guards are applied on this controller', () => {
    const guards = Reflect.getMetadata('__guards__', StudentController)

    expect(guards.length).toEqual(1)
    expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard)
  })

  describe('create', () => {
    it('should call studentService.create and return the created student', async () => {
      const createStudentDTO: CreateStudentDTO = {
        name: 'Alice Oliveira',
        email: 'alice.oliveira@email.com',
        phone: '(11) 98765-4321',
        academicRegistration: '2023123456789'
      }

      mockStudentService.create.mockResolvedValue(studentsListMock[0])

      const result = await studentController.create(createStudentDTO)

      expect(studentService.create).toHaveBeenCalledWith(createStudentDTO)
      expect(result).toEqual(studentsListMock[0])
    })
  })

  describe('findAll', () => {
    it('should call studentService.findAll with the correct filters and return the result', async () => {
      const filters: FiltersQueryStudentDTO = {
        name: 'Alice Oliveira',
        email: 'alice.oliveira@email.com',
        orderBy: 'name',
        orderDirection: 'asc',
        page: 1,
        perPage: 10
      }

      mockStudentService.findAll.mockResolvedValue(studentsListMock[0])

      const result = await studentController.findAll(filters)

      expect(studentService.findAll).toHaveBeenCalledWith(filters)
      expect(result).toEqual(studentsListMock[0])
    })
  })

  describe('findOne', () => {
    it('should call studentService.findOne with the correct ID and return the result', async () => {
      const studentId = 1

      mockStudentService.findOne.mockResolvedValue(singleStudentWithActiveLoan)

      const result = await studentController.findOne(studentId)

      expect(studentService.findOne).toHaveBeenCalledWith(studentId)
      expect(result).toEqual(singleStudentWithActiveLoan)
    })
  })

  describe('update', () => {
    it('should call studentService.update with the correct data and ID, then return the updated student', async () => {
      const studentId = 1
      const updateData: UpdatePatchStudentDTO = {
        name: 'Alice Oliveira Souza',
        updatedAt: new Date()
      }
      const updatedStudent = {
        ...studentsListMock,
        updateData
      }

      mockStudentService.update.mockResolvedValue(updatedStudent)

      const result = await studentController.update(updateData, studentId)

      expect(studentService.update).toHaveBeenCalledWith(updateData, studentId)
      expect(result).toEqual(updatedStudent)
    })
  })

  describe('delete', () => {
    it('should call studentService.delete with the correct ID and return void (204)', async () => {
      const studentId = 1

      mockStudentService.delete.mockResolvedValue(undefined)

      const result = await studentController.delete(studentId)

      expect(studentService.delete).toHaveBeenCalledWith(studentId)
      expect(result).toBeUndefined()
    })
  })
})
