import { PartialType } from '@nestjs/mapped-types'
import { CreateStudentDTO } from './create-student.dto'

export class UpdatePatchStudentDTO extends PartialType(CreateStudentDTO) {
  updatedAt: Date
}
