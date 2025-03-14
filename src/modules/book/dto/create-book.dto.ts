import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min
} from 'class-validator'

export class CreateBookDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, {
    message: 'title should not be empty'
  })
  title: string

  @IsNumber()
  @IsNotEmpty()
  authorId: number

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, {
    message: 'genre should not be empty'
  })
  genre: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  @Matches(/\S/, {
    message: 'isbn should not be empty'
  })
  isbn: string

  @IsNumber()
  @IsNotEmpty()
  @Min(1000, { message: 'the year must be 4 digits and valid' })
  @Max(9999, { message: 'the year must be 4 digits and valid' })
  yearPublished: number
}
