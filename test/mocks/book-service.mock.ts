export const booksfindAllListMock = [
  {
    id: 1,
    title: 'Dom Casmurro',
    genre: 'Romance',
    isbn: '9788572325679',
    yearPublished: 1899,
    availableQuantity: 5,
    author: { id: 1, name: 'Machado de Assis' }
  },
  {
    id: 2,
    title: '1984',
    genre: 'Dystopian',
    isbn: '9780451524935',
    yearPublished: 1949,
    availableQuantity: 5,
    author: { id: 2, name: 'George Orwell' }
  }
]

export const createdBookResponseMock = {
  id: 2,
  title: '1984',
  genre: 'Dystopian',
  authorId: 2,
  totalQuantity: 5,
  availableQuantity: 5,
  isbn: '9780451524935',
  yearPublished: 1949,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const singleBookMock = {
  id: 2,
  title: '1984',
  genre: 'Dystopian',
  authorId: 2,
  totalQuantity: 5,
  availableQuantity: 5,
  isbn: '9780451524935',
  yearPublished: 1949,
  createdAt: new Date(),
  updatedAt: new Date(),
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
  totalQuantity: 5,
  availableQuantity: 5,
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
  findBookByTitle: jest.fn(),
  findBookByIsbn: jest.fn(),
  addBooksToInventory: jest.fn(),
  removeBooksToInventory: jest.fn(),
  bookUpdate: jest.fn()
}
