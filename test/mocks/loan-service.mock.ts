export const loansListMock = [
  {
    id: 1,
    loanDate: '2025-04-07T21:23:24.000Z',
    dueDate: '2025-04-21T00:00:00.000Z',
    isActive: true,
    student: {
      name: 'Alice Oliveira',
      academicRegistration: '2025123456899'
    },
    book: {
      title: 'Animal Farm'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    loanDate: '2025-04-07T21:25:24.000Z',
    dueDate: '2025-04-22T00:00:00.000Z',
    isActive: false,
    student: {
      name: 'Bruno Santos',
      academicRegistration: '2022987654321'
    },
    book: {
      title: '1984'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export const mockLoanExists = {
  id: 1,
  studentId: 1,
  bookId: 1,
  loanDate: new Date(),
  dueDate: new Date(),
  isActive: true,
  returnDate: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockLoanWithSelect = {
  id: 1,
  loanDate: '2025-03-25T21:23:24.000Z',
  dueDate: '2025-03-26T00:00:00.000Z',
  isActive: true,
  returnDate: null,
  student: {
    id: 1,
    name: 'Alice Oliveira',
    email: 'alice.oliveira.souza@hotmail.com',
    academicRegistration: '2025123456899'
  },
  book: {
    id: 1,
    title: 'Animal Farm'
  },
  createdAt: '2025-03-25T21:23:24.000Z',
  updatedAt: '2025-03-25T21:23:24.000Z'
}

export const activeLoanMock = {
  id: 1,
  isActive: true,
  bookId: 1
}

export const inactiveLoanMock = {
  id: 2,
  isActive: false,
  bookId: 2
}

export const mockLoanService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  closeLoan: jest.fn(),
  delete: jest.fn(),
  checkIfLoanExists: jest.fn(),
  findActiveLoanByStudentId: jest.fn()
}
