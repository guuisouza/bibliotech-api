import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, Min } from 'class-validator'

export class AddBookInventoryDTO {
  @ApiProperty({
    example: 5,
    description: 'Quantity of this book to add or remove from inventory'
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1, {
    message:
      'the quantity to add or remove from inventory must be greater than 0'
  })
  amount: number
}
