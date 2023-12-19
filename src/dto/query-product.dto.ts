import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Transform, Type, plainToInstance } from 'class-transformer'
import { FindManyProductFilters } from '@/types/base'
import { FindProductDto } from './find-product.dto'

class NumberFilter {
  @ApiProperty()
  @IsOptional()
  min?: number
  @ApiProperty()
  @IsOptional()
  max?: number
}

export class FilterProductDto implements FindManyProductFilters {
  @ApiProperty()
  @IsOptional()
  name?: string
  @ApiProperty()
  @IsOptional()
  description?: string
  @ApiProperty({ type: NumberFilter })
  @IsOptional()
  @Type(() => NumberFilter)
  price?: { min?: number; max?: number }
  @ApiProperty()
  @IsString()
  @IsOptional()
  category?: string
}

export class SortProductDto {
  @ApiProperty()
  @IsString()
  orderBy!: keyof FindProductDto | 'id'

  @ApiProperty()
  @IsString()
  order!: string
}

export class QueryProductDto {
  @ApiProperty({
    required: false,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number

  @ApiProperty({
    required: false,
  })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number

  @ApiProperty({ type: FilterProductDto, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    console.log(value)
    return value ? plainToInstance(FilterProductDto, value) : undefined
  })
  @ValidateNested()
  @Type(() => FilterProductDto)
  filters?: FilterProductDto | null

  @ApiProperty({ type: Array.of(SortProductDto), required: false })
  @IsOptional()
  @Transform(({ value }) => {
    console.log(value)
    return value ? plainToInstance(SortProductDto, value) : undefined
  })
  @ValidateNested({ each: true })
  @Type(() => SortProductDto)
  sort?: SortProductDto[] | null

  @ApiProperty()
  @IsOptional()
  inclusive?: boolean
}

export class FindManyWithPaginationBody {
  @ApiProperty()
  @IsString()
  @IsOptional()
  searchValue?: string

  @ApiProperty({ type: QueryProductDto, required: true })
  query!: QueryProductDto
}
