import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  Min
} from 'class-validator'

export class CreateAuthorDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, {
    message: 'name should not be empty'
  })
  name: string

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, {
    message: 'nationality should not be empty'
  })
  nationality: string

  @IsNumber()
  @IsNotEmpty()
  @Min(1000, { message: 'the year must be 4 digits and valid' })
  @Max(9999, { message: 'the year must be 4 digits and valid' })
  birthYear: number
}
