/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../src/modules/prisma/prisma.service'
import { BookService } from '../../src/modules/book/book.service'
import { mockPrismaService } from '../mocks/prisma.mock'
import { AuthorService } from '../../src/modules/author/author.service'
import { mockAuthorService } from '../mocks/author-service.mock'
import { CreateBookDTO } from '../../src/modules/book/dto/create-book.dto'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { FiltersQueryBookDTO } from '../../src/modules/book/dto/filters-query-book.dto'
import { booksListMock } from '../mocks/book-service.mock'
import { UpdatePatchBookDTO } from '../../src/modules/book/dto/update-patch-book.dto'
import { Book } from '@prisma/client'

describe('BookService', () => {
  let bookService: BookService
  let prismaService: PrismaService
  let authorService: AuthorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuthorService, useValue: mockAuthorService }
      ]
    }).compile()

    bookService = module.get<BookService>(BookService)
    prismaService = module.get<PrismaService>(PrismaService)
    authorService = module.get<AuthorService>(AuthorService)
  })

  it('should validate definition of bookService, prismaService and authorService', () => {
    expect(bookService).toBeDefined()
    expect(prismaService).toBeDefined()
    expect(authorService).toBeDefined()
  })

  describe('create', () => {
    const createBookDto: CreateBookDTO = {
      title: 'Dom Casmurro',
      authorId: 1,
      genre: 'Romance',
      isbn: '9788572325679',
      yearPublished: 1899
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should create a new book successfully', async () => {
      jest.spyOn(prismaService.book, 'count').mockResolvedValue(0)
      jest
        .spyOn(authorService, 'checkIfAuthorExists')
        .mockResolvedValue(undefined)
      jest
        .spyOn(prismaService.book, 'create')
        .mockResolvedValue(createBookDto as any)

      const result = await bookService.create(createBookDto)

      expect(result).toEqual(createBookDto)
      expect(prismaService.book.count).toHaveBeenCalledWith({
        where: { title: createBookDto.title }
      })
      expect(authorService.checkIfAuthorExists).toHaveBeenCalledWith(
        createBookDto.authorId
      )
      expect(prismaService.book.create).toHaveBeenCalledWith({
        data: createBookDto
      })
    })

    it('should throw ConflictException if book already exists', async () => {
      jest.spyOn(prismaService.book, 'count').mockResolvedValue(1)

      await expect(bookService.create(createBookDto)).rejects.toThrow(
        new ConflictException('book already exists')
      )
      expect(prismaService.book.count).toHaveBeenCalledWith({
        where: { title: createBookDto.title }
      })
      expect(authorService.checkIfAuthorExists).not.toHaveBeenCalled()
      expect(prismaService.book.create).not.toHaveBeenCalled()
    })

    it('should throw NotFoundException if checkIfAuthorExists fails', async () => {
      jest.spyOn(prismaService.book, 'count').mockResolvedValue(0)
      jest
        .spyOn(authorService, 'checkIfAuthorExists')
        .mockRejectedValue(
          new NotFoundException(
            `author id ${createBookDto.authorId} does not exist`
          )
        )

      await expect(bookService.create(createBookDto)).rejects.toThrow(
        new NotFoundException(
          `author id ${createBookDto.authorId} does not exist`
        )
      )
      expect(prismaService.book.count).toHaveBeenCalledWith({
        where: { title: createBookDto.title }
      })
      expect(authorService.checkIfAuthorExists).toHaveBeenCalledWith(
        createBookDto.authorId
      )
      expect(prismaService.book.create).not.toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    const mockPrismaFindManyAndCount = (data: any[], total: number) => {
      jest.spyOn(prismaService.book, 'findMany').mockResolvedValue(data)
      jest.spyOn(prismaService.book, 'count').mockResolvedValue(total)
    }

    it('should return all books correctly', async () => {
      mockPrismaFindManyAndCount(booksListMock, booksListMock.length)
      const filters: FiltersQueryBookDTO = {
        page: 1,
        perPage: 5
      } as FiltersQueryBookDTO

      const result = await bookService.findAll(filters)

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('should filter books by title', async () => {
      const filters: FiltersQueryBookDTO = {
        title: 'Dom Casmurro',
        page: 1,
        perPage: 5
      } as FiltersQueryBookDTO
      const filteredMock = booksListMock.filter(
        (b) => b.title === filters.title
      )

      mockPrismaFindManyAndCount(filteredMock, filteredMock.length)

      const result = await bookService.findAll(filters)

      expect(result.data).toHaveLength(1)
      expect(result.data[0].title).toBe('Dom Casmurro')
      expect(result.total).toBe(1)
    })

    it('should filter books by genre', async () => {
      const filters: FiltersQueryBookDTO = {
        genre: 'Dystopian',
        page: 1,
        perPage: 5
      } as FiltersQueryBookDTO
      const filteredMock = booksListMock.filter(
        (b) => b.genre === filters.genre
      )

      mockPrismaFindManyAndCount(filteredMock, filteredMock.length)

      const result = await bookService.findAll(filters)

      expect(result.data).toHaveLength(1)
      expect(result.data[0].genre).toBe('Dystopian')
      expect(result.total).toBe(1)
    })

    it('should filter books by availability', async () => {
      const filters: FiltersQueryBookDTO = {
        isAvailable: true,
        page: 1,
        perPage: 5
      } as FiltersQueryBookDTO
      const filteredMock = booksListMock.filter(
        (b) => b.isAvailable === filters.isAvailable
      )

      mockPrismaFindManyAndCount(filteredMock, filteredMock.length)

      const result = await bookService.findAll(filters)

      expect(result.data).toHaveLength(1)
      expect(result.data[0].isAvailable).toBe(true)
      expect(result.total).toBe(1)
    })

    it('should return paginated books correctly', async () => {
      const filters: FiltersQueryBookDTO = {
        page: 2,
        perPage: 1
      } as FiltersQueryBookDTO
      const paginatedMock = [booksListMock[1]]

      mockPrismaFindManyAndCount(paginatedMock, booksListMock.length)

      const result = await bookService.findAll(filters)

      expect(result.page).toBe(2)
      expect(result.perPage).toBe(1)
      expect(result.totalPages).toBe(2)
      expect(result.data).toHaveLength(1)
    })

    it('should order books by title', async () => {
      const filters: FiltersQueryBookDTO = {
        orderBy: 'title',
        orderDirection: 'asc',
        page: 1,
        perPage: 5
      }

      const orderedMock = [...booksListMock].sort((a, b) =>
        a.title.localeCompare(b.title)
      )

      mockPrismaFindManyAndCount(orderedMock, orderedMock.length)
      const result = await bookService.findAll(filters)

      expect(result.data[0].title).toBe('1984')
      expect(result.data[1].title).toBe('Dom Casmurro')
    })
  })

  describe('findOne', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const bookId = 1

    it('should return a single book with its authors', async () => {
      jest.spyOn(bookService, 'checkIfBookExists').mockResolvedValue(undefined)
      jest
        .spyOn(prismaService.book, 'findUnique')
        .mockResolvedValue(booksListMock[0] as any)

      const result = await bookService.findOne(bookId)

      expect(bookService.checkIfBookExists).toHaveBeenCalledWith(bookId)
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: bookId },
        include: {
          author: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
      expect(result).toEqual(booksListMock[0])
    })

    it('should throw NotFoundException if book does not exist', async () => {
      const nonExistentId = 45
      jest
        .spyOn(bookService, 'checkIfBookExists')
        .mockRejectedValue(new NotFoundException())

      await expect(bookService.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException
      )

      expect(bookService.checkIfBookExists).toHaveBeenCalledWith(nonExistentId)
      expect(prismaService.book.findUnique).not.toHaveBeenCalled()
    })
  })

  describe('update', () => {
    const bookId = 1

    const updateData: UpdatePatchBookDTO = {
      title: 'Dom Casmurro (Edição Revisada)',
      genre: 'Romance Clássico',
      updatedAt: new Date()
    }

    const expectedUpdatedBook = {
      ...booksListMock[0],
      ...updateData
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should update the book with provided fields and return the updated book', async () => {
      jest.spyOn(bookService, 'checkIfBookExists').mockResolvedValue(undefined)
      jest
        .spyOn(prismaService.book, 'update')
        .mockResolvedValue(expectedUpdatedBook as Book)

      const result = await bookService.update(updateData, bookId)

      expect(bookService.checkIfBookExists).toHaveBeenCalledWith(bookId)
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: bookId },
        data: {
          title: updateData.title,
          genre: updateData.genre,
          updatedAt: expect.any(String)
        },
        include: {
          author: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
      expect(result).toEqual(expectedUpdatedBook)
    })

    it('should throw NotFoundException if book does not exist', async () => {
      const nonExistentId = 45
      jest
        .spyOn(bookService, 'checkIfBookExists')
        .mockRejectedValue(new NotFoundException())

      await expect(
        bookService.update(updateData, nonExistentId)
      ).rejects.toThrow(NotFoundException)

      expect(bookService.checkIfBookExists).toHaveBeenCalledWith(nonExistentId)
      expect(prismaService.book.update).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const bookId = 1

    it('should delete a single book successfull', async () => {
      jest.spyOn(bookService, 'checkIfBookExists').mockResolvedValue(undefined)
      jest.spyOn(prismaService.loan, 'count').mockResolvedValue(0)

      await expect(bookService.delete(bookId)).resolves.toBeUndefined()

      expect(bookService.checkIfBookExists).toHaveBeenCalledWith(bookId)
      expect(prismaService.loan.count).toHaveBeenCalledWith({
        where: { bookId, isActive: true }
      })
      expect(prismaService.book.delete).toHaveBeenCalledWith({
        where: { id: bookId }
      })
    })

    it('should throw ConflictException if book is still on loan', async () => {
      jest.spyOn(bookService, 'checkIfBookExists').mockResolvedValue(undefined)
      jest.spyOn(prismaService.loan, 'count').mockResolvedValue(1)

      await expect(bookService.delete(bookId)).rejects.toThrow(
        ConflictException
      )

      expect(bookService.checkIfBookExists).toHaveBeenCalledWith(bookId)
      expect(prismaService.loan.count).toHaveBeenCalledWith({
        where: { bookId, isActive: true }
      })
      expect(prismaService.book.delete).not.toHaveBeenCalled()
    })

    it('should throw NotFoundException if book does not exist', async () => {
      const nonExistentId = 134
      jest
        .spyOn(bookService, 'checkIfBookExists')
        .mockRejectedValue(new NotFoundException())

      await expect(bookService.delete(nonExistentId)).rejects.toThrow(
        NotFoundException
      )

      expect(bookService.checkIfBookExists).toHaveBeenCalledWith(nonExistentId)
      expect(prismaService.loan.count).not.toHaveBeenCalled()
      expect(prismaService.book.delete).not.toHaveBeenCalled()
    })
  })

  describe('checkIfBookExists', () => {
    const bookId = 1

    it('should not throw if book exists', async () => {
      jest
        .spyOn(prismaService.book, 'findUnique')
        .mockResolvedValue({ id: bookId } as Book)

      await expect(bookService.checkIfBookExists(bookId)).resolves.not.toThrow()
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: bookId }
      })
    })

    it('should throw NotFoundException if book does not exist', async () => {
      jest.spyOn(prismaService.book, 'findUnique').mockResolvedValue(null)

      await expect(bookService.checkIfBookExists(bookId)).rejects.toThrow(
        new NotFoundException(`book id ${bookId} does not exist`)
      )

      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: bookId }
      })
    })
  })

  describe('checkIfBookIsRented', () => {
    const bookId = 1
    const isAvailable = true

    it('should not throw if book is not rented', async () => {
      jest
        .spyOn(prismaService.book, 'findUnique')
        .mockResolvedValue({ id: bookId } as Book)

      await expect(
        bookService.checkIfBookIsRented(bookId)
      ).resolves.not.toThrow()
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: {
          id: bookId,
          isAvailable
        }
      })
    })

    it('should throw NotFoundException if book is already rented', async () => {
      jest.spyOn(prismaService.book, 'findUnique').mockResolvedValue(null)

      await expect(bookService.checkIfBookIsRented(bookId)).rejects.toThrow(
        new ConflictException('this book is already rented')
      )
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: bookId, isAvailable }
      })
    })
  })

  describe('setBookAvailability', () => {
    const bookId = 1
    const isAvailable = false

    it('should update the book availability status', async () => {
      jest.spyOn(prismaService.book, 'update').mockResolvedValue(undefined)

      await bookService.setBookAvailability(bookId, isAvailable)

      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: bookId },
        data: { isAvailable }
      })
    })
  })
})
