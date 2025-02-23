import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator'

export class CreateLoanDTO {
  @IsNumber()
  @IsNotEmpty()
  studentId: number

  @IsNumber()
  @IsNotEmpty()
  bookId: number

  @IsDateString()
  @IsNotEmpty()
  dueDate: Date
}
