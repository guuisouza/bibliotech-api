import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator'

export class CreateLoanDTO {
  @ApiProperty({
    example: 1,
    description: 'the ID of the student who is renting the book'
  })
  @IsNumber()
  @IsNotEmpty()
  studentId: number

  @ApiProperty({
    example: 1,
    description: 'the ID of the book being rented'
  })
  @IsNumber()
  @IsNotEmpty()
  bookId: number

  @ApiProperty({
    example: '2025-03-25',
    description: 'the due date to return the loan'
  })
  @IsDateString()
  @IsNotEmpty()
  dueDate: Date
}
