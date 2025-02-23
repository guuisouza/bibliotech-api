import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateBookDTO {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsNumber()
  @IsNotEmpty()
  authorId: number
}
