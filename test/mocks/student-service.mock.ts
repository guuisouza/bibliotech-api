export const studentsListMock = [
  {
    id: 1,
    name: 'Alice Oliveira',
    email: 'alice.oliveira@email.com',
    phone: '(11) 98765-4321',
    academicRegistration: '2023123456789',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: 'Bruno Santos',
    email: 'bruno.santos@email.com',
    phone: '(21) 92345-6789',
    academicRegistration: '2022987654321',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export const singleStudentWithActiveLoan = {
  id: 1,
  name: 'Alice Oliveira',
  email: 'alice.oliveira@email.com',
  phone: '(11) 98765-4321',
  academicRegistration: '2023123456789',
  createdAt: '2025-04-04T20:49:45.000Z',
  updatedAt: '2025-04-04T20:49:45.000Z',
  activeLoan: {
    id: 1,
    studentId: 1,
    bookId: 1,
    loanDate: '2025-03-25T20:48:16.000Z',
    dueDate: '2025-04-30T00:00:00.000Z',
    isActive: true,
    returnDate: null,
    createdAt: '2025-03-25T20:48:16.000Z',
    updatedAt: '2025-04-25T20:48:16.000Z'
  }
}

export const mockStudentService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  checkIfStudentExists: jest.fn(),
  findByEmail: jest.fn(),
  findByAcademicRegistration: jest.fn()
}
