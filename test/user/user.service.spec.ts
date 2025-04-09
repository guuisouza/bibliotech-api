import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from '../../src/modules/user/user.service'
import { PrismaService } from '../../src/modules/prisma/prisma.service'
import { mockPrismaService } from '../mocks/prisma.mock'
import { mockUser } from '../mocks/user-service.mock'
import { User } from '@prisma/client'
import { NotFoundException } from '@nestjs/common'

describe('User Service', () => {
  let userService: UserService
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService }
      ]
    }).compile()

    userService = module.get<UserService>(UserService)
    prismaService = module.get<PrismaService>(PrismaService)

    jest.clearAllMocks()
  })

  it('should validate definition of userService and prismaService', () => {
    expect(userService).toBeDefined()
    expect(prismaService).toBeDefined()
  })

  describe('findByEmail', () => {
    const userEmail = 'adminbiblio@email.com.br'
    it('should find user by email', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(mockUser as User)
      const user = await userService.findByEmail(userEmail)

      expect(user).toEqual(mockUser)
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: userEmail }
      })
    })

    it('should throw an exception if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)

      await expect(userService.findByEmail(userEmail)).rejects.toThrow(
        new NotFoundException('user not found')
      )
    })
  })

  describe('findById', () => {
    const userId = 1
    it('should find user by email', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(mockUser as User)
      const user = await userService.findById(userId)

      expect(user).toEqual(mockUser)
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId }
      })
    })

    it('should throw an exception if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)

      await expect(userService.findById(userId)).rejects.toThrow(
        new NotFoundException('user not found')
      )
    })
  })
})
