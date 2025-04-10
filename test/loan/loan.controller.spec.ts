import { Test, TestingModule } from '@nestjs/testing'
import { JwtAuthGuard } from '../../src/guards/jwt-auth-guard'
import { jwtAuthGuardMock } from '../mocks/jwt-auth-guard.mock'
import { LoanController } from '../../src/modules/loan/loan.controller'
import { LoanService } from '../../src/modules/loan/loan.service'
import { CreateLoanDTO } from '../../src/modules/loan/dto/create-loan.dto'
import {
  loansListMock,
  mockLoanExists,
  mockLoanService,
  mockLoanWithSelect
} from '../mocks/loan-service.mock'
import { FiltersQueryLoanDTO } from '../../src/modules/loan/dto/filters-query-loan.dto'

describe('StudentController', () => {
  let loanController: LoanController
  let loanService: LoanService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoanController],
      providers: [{ provide: LoanService, useValue: mockLoanService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtAuthGuardMock)
      .compile()

    loanController = module.get<LoanController>(LoanController)
    loanService = module.get<LoanService>(LoanService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(loanController).toBeDefined()
    expect(loanService).toBeDefined()
  })

  it('should check if the guards are applied on this controller', () => {
    const guards = Reflect.getMetadata('__guards__', LoanController)

    expect(guards.length).toEqual(1)
    expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard)
  })

  describe('create', () => {
    it('should call loanService.create and return the created loan', async () => {
      const createLoanDTO: CreateLoanDTO = {
        studentId: 1,
        bookId: 1,
        dueDate: new Date()
      }

      mockLoanService.create.mockResolvedValue(mockLoanExists)

      const result = await loanController.create(createLoanDTO)

      expect(loanService.create).toHaveBeenCalledWith(createLoanDTO)
      expect(result).toEqual(mockLoanExists)
    })
  })

  describe('findAll', () => {
    it('should call loanService.findAll with the correct filters and return the result', async () => {
      const filters: FiltersQueryLoanDTO = {
        bookId: 1,
        isActive: true,
        orderBy: 'dueDate',
        orderDirection: 'asc',
        page: 1,
        perPage: 10
      }

      mockLoanService.findAll.mockResolvedValue(loansListMock[1])

      const result = await loanController.findAll(filters)

      expect(loanService.findAll).toHaveBeenCalledWith(filters)
      expect(result).toEqual(loansListMock[1])
    })
  })

  describe('findOne', () => {
    it('should call loanService.findOne with the correct ID and return the result', async () => {
      const loanId = 1

      mockLoanService.findOne.mockResolvedValue(mockLoanWithSelect)

      const result = await loanController.findOne(loanId)

      expect(loanService.findOne).toHaveBeenCalledWith(loanId)
      expect(result).toEqual(mockLoanWithSelect)
    })
  })

  describe('closeLoan', () => {
    it('should call loanService.closeLoan with the correct ID and return void (204)', async () => {
      const loanId = 1

      mockLoanService.closeLoan.mockResolvedValue(undefined)

      const result = await loanController.closeLoan(loanId)

      expect(loanService.closeLoan).toHaveBeenCalledWith(loanId)
      expect(result).toBeUndefined()
    })
  })

  describe('delete', () => {
    it('should call loanService.delete with the correct ID and return void (204)', async () => {
      const studentId = 1

      mockLoanService.delete.mockResolvedValue(undefined)

      const result = await loanController.delete(studentId)

      expect(loanService.delete).toHaveBeenCalledWith(studentId)
      expect(result).toBeUndefined()
    })
  })
})
