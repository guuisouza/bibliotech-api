import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator'

export class CreateStudentDTO {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) =>
    value.replace(/\D/g, '').replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  )
  @Matches(/^\(\d{2}\) \d{5}-\d{4}$/, {
    message: 'the phone number must be in the format (XX) XXXXX-XXXX'
  })
  phone: string

  @IsString()
  @Length(13, 13, {
    message: 'the academic registry must be exactly 13 digits long'
  })
  academicRegistration: string
}
