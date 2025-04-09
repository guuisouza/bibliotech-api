import { Test, TestingModule } from '@nestjs/testing'
import { AuthorController } from '../../src/modules/author/author.controller'
import { AuthorService } from '../../src/modules/author/author.service'
import { CreateAuthorDTO } from '../../src/modules/author/dto/create-author.dto'
import {
  mockAuthorService,
  createdAuthor,
  authorsListMock,
  singleAuthorMock
} from '../mocks/author-service.mock'
import { JwtAuthGuard } from '../../src/guards/jwt-auth-guard'
import { jwtAuthGuardMock } from '../mocks/jwt-auth-guard.mock'
import { FiltersQueryAuthorDTO } from '../../src/modules/author/dto/filters-query-author.dto'

describe('AuthorController', () => {
  let authorController: AuthorController
  let authorService: AuthorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorController],
      providers: [{ provide: AuthorService, useValue: mockAuthorService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtAuthGuardMock)
      .compile()

    authorController = module.get<AuthorController>(AuthorController)
    authorService = module.get<AuthorService>(AuthorService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(authorController).toBeDefined()
    expect(authorService).toBeDefined()
  })

  it('should check if the guards are applied on this controller', () => {
    const guards = Reflect.getMetadata('__guards__', AuthorController)

    expect(guards.length).toEqual(1)
    expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard)
  })

  describe('create', () => {
    it('should call authorService.create and return the created author', async () => {
      const createAuthorDto: CreateAuthorDTO = {
        name: 'George Orwell',
        nationality: 'Britânico',
        birthYear: 1903
      }

      mockAuthorService.create.mockResolvedValue(createdAuthor)

      const result = await authorController.create(createAuthorDto)

      expect(authorService.create).toHaveBeenCalledWith(createAuthorDto)
      expect(result).toEqual(createdAuthor)
    })
  })

  describe('findAll', () => {
    it('should call authorService.findAll with filters and return the list', async () => {
      const filters: FiltersQueryAuthorDTO = {
        name: 'George',
        birthYearAfter: 1900,
        birthYearBefore: 2000,
        orderBy: 'name',
        orderDirection: 'asc',
        page: 1,
        perPage: 10
      }

      mockAuthorService.findAll.mockResolvedValue(authorsListMock[0])

      const result = await authorController.findAll(filters)

      expect(authorService.findAll).toHaveBeenCalledWith(filters)
      expect(result).toEqual(authorsListMock[0])
    })
  })

  describe('findOne', () => {
    it('should call authorService.findOne and return the author for a valid ID', async () => {
      const authorId = 1
      mockAuthorService.findOne.mockResolvedValue(singleAuthorMock)

      const result = await authorController.findOne(authorId)

      expect(authorService.findOne).toHaveBeenCalledWith(authorId)
      expect(result).toEqual(singleAuthorMock)
    })
  })

  describe('delete', () => {
    it('should call authorService.delete with the correct ID and return void (204)', async () => {
      const authorId = 1
      mockAuthorService.delete.mockResolvedValue(undefined)

      const result = await authorController.delete(authorId)

      expect(authorService.delete).toHaveBeenCalledWith(authorId)
      expect(result).toBeUndefined()
    })
  })
})
