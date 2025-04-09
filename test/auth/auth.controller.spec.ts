import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '../../src/modules/auth/auth.controller'
import { AuthService } from '../../src/modules/auth/auth.service'
import { UserLoginDTO } from '../../src/modules/auth/dto/user.login-dto'
import { acessToken, mockAuthService } from '../mocks/auth-service.mock'

describe('AuthController', () => {
  let authController: AuthController
  let authService: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    }).compile()

    authController = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(authController).toBeDefined()
    expect(authService).toBeDefined()
  })

  describe('login', () => {
    it('should call authService.login and return the access token', async () => {
      const loginDto: UserLoginDTO = {
        email: 'user@email.com',
        password: 'plainPassword123'
      }

      mockAuthService.login.mockResolvedValue({ acessToken })

      const result = await authController.login(loginDto)

      expect(authService.login).toHaveBeenCalledWith(loginDto)
      expect(result).toEqual({ acessToken })
    })
  })
})
