import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min
} from 'class-validator'

export class CreateAuthorDTO {
  @ApiProperty({
    example: 'George Orwell',
    description: "Author's full name"
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(90)
  @Matches(/\S/, {
    message: 'name should not be empty'
  })
  name: string

  @ApiProperty({
    example: 'Britânico',
    description: "Author's nationality"
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/\S/, {
    message: 'nationality should not be empty'
  })
  nationality: string

  @ApiProperty({
    example: 1903,
    description: 'Year of birth of the author'
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1000, { message: 'the birth year must be greater than 1000' })
  @Max(new Date().getFullYear() - 16, {
    message: 'the author must be over 16 years old'
  })
  birthYear: number
}
