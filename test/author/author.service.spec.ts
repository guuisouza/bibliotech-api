import { Test, TestingModule } from '@nestjs/testing'
import { AuthorService } from '../../src/modules/author/author.service'
import { PrismaService } from '../../src/modules/prisma/prisma.service'
import { mockPrismaService } from '../mocks/prisma.mock'
import { CreateAuthorDTO } from '../../src/modules/author/dto/create-author.dto'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { FiltersQueryAuthorDTO } from '../../src/modules/author/dto/filters-query-author.dto'

describe('Author Service', () => {
  let authorService: AuthorService
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    authorService = module.get<AuthorService>(AuthorService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should validate definition of authorService and prismaService', () => {
    expect(authorService).toBeDefined()
    expect(prismaService).toBeDefined()
  })

  describe('create', () => {
    const createAuthorDTO: CreateAuthorDTO = {
      name: 'Machado de Assis',
      nationality: 'Brasileiro',
      birthYear: 1839
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should successfully create an author', async () => {
      jest.spyOn(prismaService.author, 'count').mockResolvedValue(0)
      jest
        .spyOn(prismaService.author, 'create')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(createAuthorDTO as any)

      const result = await authorService.create(createAuthorDTO)

      expect(prismaService.author.count).toHaveBeenCalledWith({
        where: { name: createAuthorDTO.name }
      })
      expect(prismaService.author.create).toHaveBeenCalledWith({
        data: createAuthorDTO
      })
      expect(result).toEqual(createAuthorDTO)
    })

    it('should throw ConflictException if author already exists', async () => {
      jest.spyOn(prismaService.author, 'count').mockResolvedValue(1)

      await expect(authorService.create(createAuthorDTO)).rejects.toThrow(
        ConflictException
      )
      expect(prismaService.author.count).toHaveBeenCalledWith({
        where: { name: createAuthorDTO.name }
      })
      expect(prismaService.author.create).not.toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    const authorsMock = [
      {
        id: 1,
        name: 'Machado de Assis',
        nationality: 'Brasileiro',
        birthYear: 1839,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'George Orwell',
        nationality: 'Britânico',
        birthYear: 1903,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockPrismaFindManyAndCount = (data: any[], total: number) => {
      jest.spyOn(prismaService.author, 'findMany').mockResolvedValue(data)
      jest.spyOn(prismaService.author, 'count').mockResolvedValue(total)
    }

    it('should return paginated authors without filters', async () => {
      const filters: FiltersQueryAuthorDTO = {
        page: 1,
        perPage: 2,
        orderBy: 'name',
        orderDirection: 'asc'
      } as FiltersQueryAuthorDTO

      mockPrismaFindManyAndCount(authorsMock, authorsMock.length)

      const result = await authorService.findAll(filters)

      expect(result).toEqual({
        total: 2,
        page: 1,
        perPage: 2,
        totalPages: 1,
        data: authorsMock
      })
    })

    it('should filter authors by name', async () => {
      const filters: FiltersQueryAuthorDTO = {
        name: 'Machado de Assis',
        page: 1,
        perPage: 5
      } as FiltersQueryAuthorDTO

      const filteredMock = authorsMock.filter((a) => a.name === filters.name)

      mockPrismaFindManyAndCount(filteredMock, filteredMock.length)

      const result = await authorService.findAll(filters)

      expect(result.data).toHaveLength(1)
      expect(result.data[0].name).toBe('Machado de Assis')
      expect(result.total).toBe(1)
    })

    it('should filter authors by birth year range', async () => {
      const filters: FiltersQueryAuthorDTO = {
        birthYearAfter: 1800,
        birthYearBefore: 2000,
        page: 1,
        perPage: 10
      } as FiltersQueryAuthorDTO

      mockPrismaFindManyAndCount(authorsMock, authorsMock.length)

      const result = await authorService.findAll(filters)

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('should return paginated authors correctly', async () => {
      const filters: FiltersQueryAuthorDTO = {
        page: 2,
        perPage: 1
      } as FiltersQueryAuthorDTO

      const paginatedMock = [authorsMock[1]] // Pegando o segundo autor (página 2, 1 item por página)

      mockPrismaFindManyAndCount(paginatedMock, authorsMock.length)

      const result = await authorService.findAll(filters)

      expect(result.page).toBe(2)
      expect(result.perPage).toBe(1)
      expect(result.totalPages).toBe(2)
      expect(result.data).toHaveLength(1)
    })
  })

  describe('findOne', () => {
    const authorId = 1

    const authorWithBooks = {
      id: 1,
      name: 'Machado de Assis',
      nationality: 'Brasileiro',
      birthYear: 1839,
      createdAt: new Date('2025-03-14T18:53:09.000Z'),
      updatedAt: new Date('2025-03-14T18:53:09.000Z'),
      books: [
        {
          id: 1,
          title: '1984',
          genre: 'Distopia',
          authorId: 6,
          isAvailable: true,
          isbn: '9780451524935',
          yearPublished: 1949,
          createdAt: new Date('2025-03-14T19:07:06.000Z'),
          updatedAt: new Date('2025-03-14T19:07:06.000Z')
        }
      ]
    }

    const authorWithoutBooks = { ...authorWithBooks, books: [] }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should return an author with books', async () => {
      jest
        .spyOn(authorService, 'checkIfAuthorExists')
        .mockResolvedValue(undefined)
      jest
        .spyOn(prismaService.author, 'findUnique')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(authorWithBooks as any)

      const result = await authorService.findOne(authorId)

      expect(authorService.checkIfAuthorExists).toHaveBeenCalledWith(authorId)
      expect(prismaService.author.findUnique).toHaveBeenCalledWith({
        where: { id: authorId },
        include: { books: true }
      })
      expect(result).toEqual(authorWithBooks)
    })

    it('should return an author without books', async () => {
      jest
        .spyOn(authorService, 'checkIfAuthorExists')
        .mockResolvedValue(undefined)
      jest
        .spyOn(prismaService.author, 'findUnique')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(authorWithoutBooks as any)

      const result = await authorService.findOne(authorId)

      expect(authorService.checkIfAuthorExists).toHaveBeenCalledWith(authorId)
      expect(prismaService.author.findUnique).toHaveBeenCalledWith({
        where: { id: authorId },
        include: { books: true }
      })
      expect(result).toEqual(authorWithoutBooks)
    })

    it('should throw NotFoundException if author does not exist', async () => {
      const nonExistentId = 45
      jest
        .spyOn(authorService, 'checkIfAuthorExists')
        .mockRejectedValue(
          new NotFoundException(`author id ${nonExistentId} does not exist`)
        )

      await expect(authorService.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException
      )

      expect(authorService.checkIfAuthorExists).toHaveBeenCalledWith(
        nonExistentId
      )
      expect(prismaService.author.findUnique).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    const authorId = 1

    it('should throw NotFoundException if author does not exist', async () => {
      jest
        .spyOn(authorService, 'checkIfAuthorExists')
        .mockRejectedValue(
          new NotFoundException(`author id ${authorId} does not exist`)
        )

      await expect(authorService.delete(authorId)).rejects.toThrow(
        NotFoundException
      )

      expect(prismaService.book.count).not.toHaveBeenCalled()
      expect(prismaService.author.delete).not.toHaveBeenCalled()
    })

    it('should throw ConflictException if author has books', async () => {
      jest
        .spyOn(authorService, 'checkIfAuthorExists')
        .mockResolvedValue(undefined)
      jest.spyOn(prismaService.book, 'count').mockResolvedValue(1)

      await expect(authorService.delete(authorId)).rejects.toThrow(
        ConflictException
      )

      expect(prismaService.author.delete).not.toHaveBeenCalled()
    })

    it('should successfully delete the author', async () => {
      jest
        .spyOn(authorService, 'checkIfAuthorExists')
        .mockResolvedValue(undefined)
      jest.spyOn(prismaService.book, 'count').mockResolvedValue(0)
      jest.spyOn(prismaService.author, 'delete').mockResolvedValue(undefined)

      await expect(authorService.delete(authorId)).resolves.toBeUndefined()

      expect(prismaService.author.delete).toHaveBeenCalledWith({
        where: { id: authorId }
      })
    })
  })

  describe('checkIfAuthorExists', () => {
    const authorId = 1

    it('should not throw if author exists', async () => {
      jest
        .spyOn(prismaService.author, 'findUnique')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue({ id: authorId } as any)

      await expect(
        authorService.checkIfAuthorExists(authorId)
      ).resolves.not.toThrow()

      expect(prismaService.author.findUnique).toHaveBeenCalledWith({
        where: { id: authorId }
      })
    })

    it('should throw NotFoundException if author does not exist', async () => {
      jest.spyOn(prismaService.author, 'findUnique').mockResolvedValue(null)

      await expect(authorService.checkIfAuthorExists(authorId)).rejects.toThrow(
        new NotFoundException(`author id ${authorId} does not exist`)
      )

      expect(prismaService.author.findUnique).toHaveBeenCalledWith({
        where: { id: authorId }
      })
    })
  })
})
