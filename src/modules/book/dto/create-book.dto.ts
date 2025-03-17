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
  @MaxLength(250)
  @Matches(/\S/, {
    message: 'title should not be empty'
  })
  title: string

  @IsNumber()
  @IsNotEmpty()
  authorId: number

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
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
  @Min(1000, { message: 'the published year must be greater than 1000' })
  @Max(new Date().getFullYear(), {
    message: 'the published year must be less than the current year'
  })
  yearPublished: number
}
