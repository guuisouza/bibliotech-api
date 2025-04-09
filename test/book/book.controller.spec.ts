import { Test, TestingModule } from '@nestjs/testing'
import { BookController } from '../../src/modules/book/book.controller'
import { BookService } from '../../src/modules/book/book.service'
import {
  booksListMock,
  mockBookService,
  singleBookMock
} from '../mocks/book-service.mock'
import { JwtAuthGuard } from '../../src/guards/jwt-auth-guard'
import { jwtAuthGuardMock } from '../mocks/jwt-auth-guard.mock'
import { CreateBookDTO } from '../../src/modules/book/dto/create-book.dto'
import { FiltersQueryBookDTO } from '../../src/modules/book/dto/filters-query-book.dto'
import { UpdatePatchBookDTO } from '../../src/modules/book/dto/update-patch-book.dto'

describe('BookController', () => {
  let bookController: BookController
  let bookService: BookService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [{ provide: BookService, useValue: mockBookService }]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtAuthGuardMock)
      .compile()

    bookController = module.get<BookController>(BookController)
    bookService = module.get<BookService>(BookService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(bookController).toBeDefined()
    expect(bookService).toBeDefined()
  })

  it('should check if the guards are applied on this controller', () => {
    const guards = Reflect.getMetadata('__guards__', BookController)

    expect(guards.length).toEqual(1)
    expect(new guards[0]()).toBeInstanceOf(JwtAuthGuard)
  })

  describe('create', () => {
    it('should call bookService.create and return the created book', async () => {
      const createAuthorDto: CreateBookDTO = {
        title: '1984',
        authorId: 2,
        genre: 'Dystopian',
        isbn: '9780451524935',
        yearPublished: 1949
      }

      mockBookService.create.mockResolvedValue(booksListMock[1])

      const result = await bookController.create(createAuthorDto)

      expect(bookService.create).toHaveBeenCalledWith(createAuthorDto)
      expect(result).toEqual(booksListMock[1])
    })
  })

  describe('findAll', () => {
    it('should call bookService.findAll with the correct filters and return the result', async () => {
      const filters: FiltersQueryBookDTO = {
        title: '1984',
        genre: 'Dystopian',
        yearPublishedAfter: 1940,
        yearPublishedBefore: 1950,
        isbn: '9780451524935',
        isAvailable: true,
        orderBy: 'title',
        orderDirection: 'asc',
        page: 2,
        perPage: 10
      }

      mockBookService.findAll.mockResolvedValue(booksListMock[1])

      const result = await bookController.findAll(filters)

      expect(bookService.findAll).toHaveBeenCalledWith(filters)
      expect(result).toEqual(booksListMock[1])
    })
  })

  describe('findOne', () => {
    it('should call bookService.findOne with the correct ID and return the result', async () => {
      const bookId = 1

      mockBookService.findOne.mockResolvedValue(singleBookMock)

      const result = await bookController.findOne(bookId)

      expect(bookService.findOne).toHaveBeenCalledWith(bookId)
      expect(result).toEqual(singleBookMock)
    })
  })

  describe('update', () => {
    it('should call bookService.update with the correct data and ID, then return the updated book', async () => {
      const bookId = 1
      const updateData: UpdatePatchBookDTO = {
        title: 'Animal Farm',
        updatedAt: new Date()
      }
      const updatedBook = { bookId, title: 'Animal Farm' }

      mockBookService.update.mockResolvedValue(updatedBook)

      const result = await bookController.update(updateData, bookId)

      expect(bookService.update).toHaveBeenCalledWith(updateData, bookId)
      expect(result).toEqual(updatedBook)
    })
  })

  describe('delete', () => {
    it('should call bookService.delete with the correct ID and return void (204)', async () => {
      const bookId = 1

      mockBookService.delete.mockResolvedValue(undefined)

      const result = await bookController.delete(bookId)

      expect(bookService.delete).toHaveBeenCalledWith(bookId)
      expect(result).toBeUndefined()
    })
  })
})
