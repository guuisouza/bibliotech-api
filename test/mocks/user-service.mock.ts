export const mockUser = {
  id: 1,
  username: 'AdminBibliotech',
  email: 'adminbiblio@email.com.br',
  password: '$10$KY6M6oExb2yhMXMH/zMuFOkcthU3LZFS0OPCGVZAa37AbT8LG7XZa',
  createdAt: new Date(),
  updatedAt: new Date()
}

export const mockUserService = {
  findByEmail: jest.fn(),
  findById: jest.fn()
}
