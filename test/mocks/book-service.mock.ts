export const booksListMock = [
  {
    id: 1,
    title: 'Dom Casmurro',
    genre: 'Romance',
    isbn: '9788572325679',
    yearPublished: 1899,
    isAvailable: true,
    author: { id: 1, name: 'Machado de Assis' },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    title: '1984',
    genre: 'Dystopian',
    isbn: '9780451524935',
    yearPublished: 1949,
    isAvailable: false,
    author: { id: 2, name: 'George Orwell' },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export const singleBookMock = {
  id: 2,
  title: '1984',
  genre: 'Dystopian',
  authorId: 2,
  isbn: '9780451524935',
  yearPublished: 1949,
  createdAt: '2025-03-24T19:56:45.000Z',
  updatedAt: '2025-03-24T19:56:45.000Z',
  author: {
    id: 2,
    name: 'George Orwell'
  }
}

export const bookMock = {
  id: 1,
  title: '1984',
  genre: 'Dystopian',
  authorId: 1,
  isAvailable: true,
  isbn: '9780451524935',
  yearPublished: 1949,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockBookService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  checkIfBookExists: jest.fn(),
  checkIfBookIsRented: jest.fn(),
  setBookAvailability: jest.fn(),
  findBookByTitle: jest.fn(),
  findBookByIsbn: jest.fn()
}
