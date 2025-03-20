import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

export class FiltersQueryStudentDTO {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  email?: string

  @IsOptional()
  @IsString()
  ra?: string

  @IsOptional()
  @IsEnum(['name'])
  orderBy?: 'name'

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
