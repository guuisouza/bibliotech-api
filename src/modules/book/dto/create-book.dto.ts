import { ApiProperty } from '@nestjs/swagger'
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min
} from 'class-validator'

export class CreateBookDTO {
  @ApiProperty({
    example: 'Animal Farm',
    description: 'Book title'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  @Matches(/\S/, {
    message: 'title should not be empty'
  })
  title: string

  @ApiProperty({
    example: '1',
    description: 'Book author ID'
  })
  @IsNumber()
  @IsNotEmpty()
  authorId: number

  @ApiProperty({
    example: 'Satire',
    description: 'Main genre of the book'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/\S/, {
    message: 'genre should not be empty'
  })
  genre: string

  @ApiProperty({
    example: '9788535909553',
    description: 'Book isbn registration'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  @Matches(/\S/, {
    message: 'isbn should not be empty'
  })
  isbn: string

  @ApiProperty({
    example: 1945,
    description: 'Year the book was published'
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1000, { message: 'the published year must be greater than 1000' })
  @Max(new Date().getFullYear(), {
    message: 'the published year must be less than the current year'
  })
  yearPublished: number

  @ApiProperty({
    example: 10,
    description: 'Quantity of this book in inventory'
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1, {
    message:
      'the total quantity of this book in inventory must be greater than 0'
  })
  totalQuantity: number
}
