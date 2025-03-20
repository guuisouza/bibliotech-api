import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator'
import { Transform } from 'class-transformer'

export class FiltersQueryBookDTO {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  genre?: string

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  yearPublishedAfter?: number

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  yearPublishedBefore?: number

  @IsOptional()
  @IsString()
  isbn?: string

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isAvailable?: boolean

  @IsOptional()
  @IsEnum(['title', 'yearPublished'])
  orderBy?: 'title' | 'yearPublished'

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
