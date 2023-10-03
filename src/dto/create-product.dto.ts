import { IsNotEmpty } from 'class-validator'
import { Type } from 'class-transformer'
import { Category } from '../entities/category.entity'

export class CreateProductDto {
  @IsNotEmpty()
  readonly name: string
  readonly description?: string
  @IsNotEmpty()
  readonly price: number
  @IsNotEmpty()
  readonly category: string
}

export class CreatedProductDto {
  _id: string
  name: string
  description?: string
  price: number
  @Type(() => Category)
  category: Category
}
