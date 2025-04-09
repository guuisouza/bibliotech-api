export const mockAuthorService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  checkIfAuthorExists: jest.fn()
}

export const createdAuthor = {
  id: 1,
  name: 'George Orwell',
  nationality: 'Britânico',
  birthYear: 1903,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const authorsListMock = [
  { id: 1, name: 'George Orwell', birthYear: 1903, nationality: 'Britânico' },
  { id: 2, name: 'Aldous Huxley', birthYear: 1894, nationality: 'Britânico' }
]

export const singleAuthorMock = {
  id: 1,
  name: 'George Orwell',
  nationality: 'Britânico',
  birthYear: 1903,
  createdAt: '2025-03-14T18:53:09.000Z',
  updatedAt: '2025-03-14T18:53:09.000Z',
  books: [
    {
      id: 1,
      title: '1984',
      genre: 'Distopia',
      authorId: 6,
      isAvailable: true,
      isbn: '9780451524935',
      yearPublished: 1949,
      createdAt: '2025-03-14T19:07:06.000Z',
      updatedAt: '2025-03-14T19:07:06.000Z'
    }
  ]
}
