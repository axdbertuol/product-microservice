import { IsNotEmpty } from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { ObjectId } from 'mongoose'
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
