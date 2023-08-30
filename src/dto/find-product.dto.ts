import { Category } from '../entities/category.entity'
import { Expose, Transform, Type } from 'class-transformer'
import { IsString } from 'class-validator'
export class FindProductDto {
  @Expose({ name: 'id' }) // Expose decorator to set the alias
  @Transform((value) => value.toString()) // Transform decorator to convert the value to string
  @IsString()
  _id?: string
  name?: string
  description?: string
  price?: number
  @Type(() => Category)
  category?: Category
}
