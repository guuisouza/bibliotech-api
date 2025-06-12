import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UserLoginDTO } from './dto/user.login-dto'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  ApiLoginBadRequestResponse,
  ApiLoginUnauthorizedResponse
} from 'src/swagger/responses/login.responses'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiLoginBadRequestResponse()
  @ApiLoginUnauthorizedResponse()
  @Post('login')
  @HttpCode(200)
  async login(@Body() { email, password }: UserLoginDTO) {
    return this.authService.login({ email, password })
  }
}
