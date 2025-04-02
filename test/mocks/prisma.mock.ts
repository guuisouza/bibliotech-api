export const mockPrismaService = {
  author: {
    count: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn()
  },
  book: {
    count: jest.fn()
  }
}
