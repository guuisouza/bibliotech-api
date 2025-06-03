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
import {
  bookMock,
  booksfindAllListMock,
  createdBookResponseMock,
  singleBookMock
} from '../mocks/book-service.mock'
import { UpdatePatchBookDTO } from '../../src/modules/book/dto/update-patch-book.dto'
import { Book } from '@prisma/client'
import { AddBookInventoryDTO } from '../../src/modules/book/dto/add-book-inventory.dto'
import { RemoveBookInventoryDTO } from '../../src/modules/book/dto/remove-book-inventory.dto'

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
      title: '1984',
      genre: 'Dystopian',
      authorId: 2,
      totalQuantity: 5,
      isbn: '9780451524935',
      yearPublished: 1949
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should create a new book successfully', async () => {
      jest.spyOn(prismaService.book, 'count').mockResolvedValue(0)
      jest.spyOn(bookService, 'findBookByIsbn').mockResolvedValue(null)
      jest
        .spyOn(authorService, 'checkIfAuthorExists')
        .mockResolvedValue(undefined)
      jest
        .spyOn(prismaService.book, 'create')
        .mockResolvedValue(createdBookResponseMock as Book)

      const result = await bookService.create(createBookDto)

      expect(result).toEqual(createdBookResponseMock)
      expect(prismaService.book.count).toHaveBeenCalledWith({
        where: { title: createBookDto.title }
      })
      expect(bookService.findBookByIsbn).toHaveBeenCalledWith(
        createBookDto.isbn
      )
      expect(authorService.checkIfAuthorExists).toHaveBeenCalledWith(
        createBookDto.authorId
      )
      expect(prismaService.book.create).toHaveBeenCalledWith({
        data: {
          ...createBookDto,
          availableQuantity: createBookDto.totalQuantity
        }
      })
    })

    it('should throw ConflictException if book already exists', async () => {
      jest.spyOn(prismaService.book, 'count').mockResolvedValue(1)

      await expect(bookService.create(createBookDto)).rejects.toThrow(
        new ConflictException('this book already exists')
      )
      expect(prismaService.book.count).toHaveBeenCalledWith({
        where: { title: createBookDto.title }
      })
      expect(authorService.checkIfAuthorExists).not.toHaveBeenCalled()
      expect(prismaService.book.create).not.toHaveBeenCalled()
    })

    it('should throw ConflictException if a book with the same ISBN already exists', async () => {
      jest.spyOn(prismaService.book, 'count').mockResolvedValue(0)

      jest
        .spyOn(bookService, 'findBookByIsbn')
        .mockResolvedValue(createdBookResponseMock)

      await expect(bookService.create(createBookDto)).rejects.toThrow(
        new ConflictException('this book already exists')
      )

      expect(prismaService.book.count).toHaveBeenCalledWith({
        where: { title: createBookDto.title }
      })
      expect(bookService.findBookByIsbn).toHaveBeenCalledWith(
        createBookDto.isbn
      )
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
      mockPrismaFindManyAndCount(
        booksfindAllListMock,
        booksfindAllListMock.length
      )
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
      const filteredMock = booksfindAllListMock.filter(
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
      const filteredMock = booksfindAllListMock.filter(
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
      const filteredMock = booksfindAllListMock.filter(
        (b) => b.availableQuantity > 0
      )

      mockPrismaFindManyAndCount(filteredMock, filteredMock.length)

      const result = await bookService.findAll(filters)

      expect(result.data).toHaveLength(filteredMock.length)
      expect(result.total).toBe(filteredMock.length)
      result.data.forEach((book) => {
        expect(book.availableQuantity).toBeGreaterThan(0)
      })
    })

    it('should return only unavailable books when isAvailable is false', async () => {
      const filters: FiltersQueryBookDTO = {
        isAvailable: false,
        page: 1,
        perPage: 5
      } as FiltersQueryBookDTO

      const unavailableBooksMock = booksfindAllListMock.filter(
        (b) => b.availableQuantity === 0
      )

      mockPrismaFindManyAndCount(
        unavailableBooksMock,
        unavailableBooksMock.length
      )

      const result = await bookService.findAll(filters)

      expect(result.data).toHaveLength(unavailableBooksMock.length)
      expect(result.total).toBe(unavailableBooksMock.length)
      result.data.forEach((book) => {
        expect(book.availableQuantity).toBe(0)
      })
    })

    it('should return paginated books correctly', async () => {
      const filters: FiltersQueryBookDTO = {
        page: 2,
        perPage: 1
      } as FiltersQueryBookDTO
      const paginatedMock = [booksfindAllListMock[1]]

      mockPrismaFindManyAndCount(paginatedMock, booksfindAllListMock.length)

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

      const orderedMock = [...booksfindAllListMock].sort((a, b) =>
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

    const bookId = 2

    it('should return a single book with its authors', async () => {
      jest.spyOn(bookService, 'checkIfBookExists').mockResolvedValue(undefined)
      jest
        .spyOn(prismaService.book, 'findUnique')
        .mockResolvedValue(singleBookMock)

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
      expect(result).toEqual(singleBookMock)
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
      ...bookMock,
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

  describe('findBookByTitle', () => {
    it('should return the book with the given title', async () => {
      jest.spyOn(prismaService.book, 'findFirst').mockResolvedValue(bookMock)

      const title = '1984'

      const result = await bookService.findBookByTitle(title)

      expect(prismaService.book.findFirst).toHaveBeenCalledWith({
        where: { title }
      })
      expect(result).toEqual(bookMock)
    })
  })

  describe('findBookByIsbn', () => {
    it('should return the book with the given isbn', async () => {
      jest.spyOn(prismaService.book, 'findFirst').mockResolvedValue(bookMock)

      const isbn = '9780451524935'

      const result = await bookService.findBookByIsbn(isbn)

      expect(prismaService.book.findFirst).toHaveBeenCalledWith({
        where: { isbn }
      })
      expect(result).toEqual(bookMock)
    })
  })

  describe('addBooksToInventory', () => {
    const bookId = 1
    const dto: AddBookInventoryDTO = { amount: 3 }

    it('should call checkIfBookExists and increment quantities', async () => {
      jest.spyOn(bookService, 'checkIfBookExists').mockResolvedValue(undefined)

      const updatedBook = {
        ...bookMock,
        totalQuantity: bookMock.totalQuantity + dto.amount,
        availableQuantity: bookMock.availableQuantity + dto.amount
      }

      jest.spyOn(prismaService.book, 'update').mockResolvedValue(updatedBook)

      const result = await bookService.addBooksToInventory(bookId, dto)

      expect(bookService.checkIfBookExists).toHaveBeenCalledWith(bookId)
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: bookId },
        data: {
          totalQuantity: { increment: dto.amount },
          availableQuantity: { increment: dto.amount }
        }
      })
      expect(result).toEqual(updatedBook)
    })
  })

  describe('removeBooksToInventory', () => {
    const bookId = 1
    const dto: RemoveBookInventoryDTO = { amount: 2 }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should decrement quantities if book exists and enough available', async () => {
      jest.spyOn(prismaService.book, 'findUnique').mockResolvedValue(bookMock)

      const updatedBook = {
        ...bookMock,
        totalQuantity: bookMock.totalQuantity - dto.amount,
        availableQuantity: bookMock.availableQuantity - dto.amount
      }

      jest.spyOn(prismaService.book, 'update').mockResolvedValue(updatedBook)

      const result = await bookService.removeBooksToInventory(bookId, dto)

      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: bookId }
      })
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: bookId },
        data: {
          totalQuantity: { decrement: dto.amount },
          availableQuantity: { decrement: dto.amount }
        }
      })
      expect(result).toEqual(updatedBook)
    })

    it('should throw NotFoundException if book does not exist', async () => {
      jest.spyOn(prismaService.book, 'findUnique').mockResolvedValue(null)

      await expect(
        bookService.removeBooksToInventory(bookId, dto)
      ).rejects.toThrow(
        new NotFoundException(`book id ${bookId} does not exist`)
      )

      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: bookId }
      })
      expect(prismaService.book.update).not.toHaveBeenCalled()
    })

    it('should throw ConflictException if trying to remove more than available', async () => {
      const insufficientBook = { ...bookMock, availableQuantity: 1 }

      jest
        .spyOn(prismaService.book, 'findUnique')
        .mockResolvedValue(insufficientBook)

      const tooMuch = { amount: 5 }

      await expect(
        bookService.removeBooksToInventory(bookId, tooMuch)
      ).rejects.toThrow(
        new ConflictException(
          `cannot remove more than ${insufficientBook.availableQuantity} available books`
        )
      )

      expect(prismaService.book.findUnique).toHaveBeenCalled()
      expect(prismaService.book.update).not.toHaveBeenCalled()
    })
  })
})
