import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class UserLoginDTO {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address'
  })
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'yourPassword123',
    description: 'User password'
  })
  @IsString()
  password: string
}
