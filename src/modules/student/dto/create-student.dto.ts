import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength
} from 'class-validator'

export class CreateStudentDTO {
  @ApiProperty({
    example: 'Alice Oliveira',
    description: "Student's full name"
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(90)
  @Matches(/\S/, {
    message: 'name should not be empty'
  })
  name: string

  @ApiProperty({
    example: 'alice.oliveira@email.com',
    description: "Student's email"
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    example: '(11) 98765-4321',
    description: "Student's phone"
  })
  @IsNotEmpty()
  @IsString()
  @Length(15, 15, {
    message:
      'the phone number must be exactly 15 characters long (format: (XX) XXXXX-XXXX)'
  })
  @Matches(/^\(\d{2}\) \d{5}-\d{4}$/, {
    message: 'the phone number must be in the format (XX) XXXXX-XXXX'
  })
  phone: string

  @ApiProperty({
    example: '2023123456789',
    description: 'Student academic record'
  })
  @IsString()
  @Length(13, 13, {
    message: 'the academic registry must be exactly 13 digits long'
  })
  @Matches(/\S/, {
    message: 'academic registration should not be empty'
  })
  academicRegistration: string
}
