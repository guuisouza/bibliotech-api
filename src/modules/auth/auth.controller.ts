import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UserLoginDTO } from './dto/user.login-dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() { email, password }: UserLoginDTO) {
    return this.authService.login({ email, password })
  }
}
