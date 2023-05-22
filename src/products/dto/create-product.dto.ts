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
  readonly _id: string
  readonly name: string
  readonly description?: string
  readonly price: number
  @Type(() => Category)
  readonly category: Category
}
