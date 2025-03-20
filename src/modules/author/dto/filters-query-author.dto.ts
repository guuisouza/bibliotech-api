import { Transform } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

export class FiltersQueryAuthorDTO {
  @IsOptional()
  @IsString()
  name: string

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  birthYearAfter: number

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  birthYearBefore: number

  @IsOptional()
  @IsEnum(['name', 'birthYear'])
  orderBy?: 'name' | 'birthYear'

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
