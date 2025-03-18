import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UserService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import { UserLoginDTO } from './dto/user.login-dto'
import { User } from '@prisma/client'

export interface JwtPayload {
  sub: number
  email: string
  iat?: number
  exp?: number
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async login(loginDTO: UserLoginDTO) {
    const user = await this.userService.findByEmail(loginDTO.email)

    if (!user) {
      throw new UnauthorizedException('incorrect email or password')
    }

    const isPasswordValid = await bcrypt.compare(
      loginDTO.password,
      user.password
    )

    if (!isPasswordValid) {
      throw new UnauthorizedException('incorrect email or password')
    }

    return this.generateToken(user)
  }

  private generateToken(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email
    }

    return { acessToken: this.jwtService.sign(payload) }
  }
}
