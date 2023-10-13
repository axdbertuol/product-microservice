import { IsNotEmpty, MinLength } from 'class-validator'
import { Type } from 'class-transformer'
import { Category } from '../entities/category.entity'

export class CreateProductDto {
  @MinLength(2, { message: 'Name should have at least 2 characters' })
  @IsNotEmpty({ message: 'Name should have at least 2 characters' })
  readonly name: string
  readonly description?: string
  @IsNotEmpty({ message: 'Price should be set' })
  readonly price: number
  @IsNotEmpty({ message: 'Category should have at least 2 characters' })
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
