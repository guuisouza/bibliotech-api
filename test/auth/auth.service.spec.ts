import { UserService } from '../../src/modules/user/user.service'
import { AuthService } from '../../src/modules/auth/auth.service'
import { Test, TestingModule } from '@nestjs/testing'
import { mockUser, mockUserService } from '../mocks/user-service.mock'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { acessToken } from '../mocks/auth-service.mock'
import { UnauthorizedException } from '@nestjs/common'

describe('Auth Service', () => {
  let authService: AuthService
  let userService: UserService
  let jwtService: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: { sign: jest.fn() } }
      ]
    }).compile()

    authService = module.get<AuthService>(AuthService)
    userService = module.get<UserService>(UserService)
    jwtService = module.get<JwtService>(JwtService)

    jest.clearAllMocks()
  })

  it('should validate definition of loanService, bookService, studentService and prismaService', () => {
    expect(authService).toBeDefined()
    expect(userService).toBeDefined()
    expect(jwtService).toBeDefined()
  })

  describe('login', () => {
    it('should login successfully and return an access token', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as User)
      jest
        .spyOn(bcrypt, 'compare')
        .mockResolvedValue(Promise.resolve(true) as never)
      jest.spyOn(jwtService, 'sign').mockReturnValue(acessToken)

      const result = await authService.login({
        email: mockUser.email,
        password: 'plainPassword123'
      })

      expect(userService.findByEmail).toHaveBeenCalledWith(mockUser.email)
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plainPassword123',
        mockUser.password
      )
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email
      })
      expect(result).toEqual({ acessToken })
    })

    it('should throw UnauthorizedException if email is incorrect', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null)

      await expect(
        authService.login({
          email: 'wrong@email.com',
          password: 'irrelevant'
        })
      ).rejects.toThrow(
        new UnauthorizedException('incorrect email or password')
      )
      expect(userService.findByEmail).toHaveBeenCalledWith('wrong@email.com')
      expect(bcrypt.compare).not.toHaveBeenCalled()
      expect(jwtService.sign).not.toHaveBeenCalled()
    })

    it('should throw UnauthorizedException if password is incorrect', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as User)
      jest
        .spyOn(bcrypt, 'compare')
        .mockResolvedValue(Promise.resolve(false) as never)

      await expect(
        authService.login({
          email: mockUser.email,
          password: 'wrongPassword'
        })
      ).rejects.toThrow(
        new UnauthorizedException('incorrect email or password')
      )
      expect(userService.findByEmail).toHaveBeenCalledWith(mockUser.email)
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        mockUser.password
      )
      expect(jwtService.sign).not.toHaveBeenCalled()
    })
  })
})
