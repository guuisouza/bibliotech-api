import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional
} from 'class-validator'

export class FiltersQueryLoanDTO {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  studentId?: number

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  bookId?: number

  @IsOptional()
  @IsDateString()
  loanDateStart?: string

  @IsOptional()
  @IsDateString()
  loanDateLimit?: string

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean

  @IsOptional()
  @IsEnum(['loanDate', 'dueDate'])
  orderBy?: 'loanDate' | 'dueDate'

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  orderDirection: 'asc' | 'desc' = 'asc'

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  page: number = 1

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  perPage: number = 5
}
