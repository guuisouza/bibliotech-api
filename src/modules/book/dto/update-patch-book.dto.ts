import { PartialType } from '@nestjs/mapped-types'
import { CreateBookDTO } from './create-book.dto'

export class UpdatePatchBookDTO extends PartialType(CreateBookDTO) {
  updatedAt: Date
}
