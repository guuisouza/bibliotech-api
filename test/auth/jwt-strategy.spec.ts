import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mockUser, mockUserService } from '../mocks/user-service.mock'
import { JwtStrategy } from '../../src/modules/auth/strategies/jwt.strategy'
import { UserService } from '../../src/modules/user/user.service'
import { ConfigService } from '@nestjs/config'

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy
  let userService: UserService

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET_KEY') {
        return 'test-secret-key'
      }
      return null
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserService, useValue: mockUserService },
        { provide: ConfigService, useValue: mockConfigService }
      ]
    }).compile()

    jwtStrategy = module.get(JwtStrategy)
    userService = module.get(UserService)

    jest.clearAllMocks()
  })

  it('should validate definition of jwtStrategy and userService', () => {
    expect(userService).toBeDefined()
    expect(jwtStrategy).toBeDefined()
  })

  it('should validate and return user data', async () => {
    mockUserService.findById.mockResolvedValue(mockUser)

    const payload = { sub: mockUser.id, email: mockUser.email }
    const result = await jwtStrategy.validate(payload)

    expect(userService.findById).toHaveBeenCalledWith(mockUser.id)
    expect(result).toEqual({
      userId: mockUser.id,
      email: mockUser.email
    })
  })

  it('should throw UnauthorizedException if user is not found', async () => {
    mockUserService.findById.mockResolvedValue(null)

    const payload = { sub: 999, email: 'notfound@email.com' }

    await expect(jwtStrategy.validate(payload)).rejects.toThrow(
      new UnauthorizedException('user not found')
    )

    expect(userService.findById).toHaveBeenCalledWith(999)
  })
})
