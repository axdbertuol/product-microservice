import { ObjectId } from 'mongoose'
import { Category } from '../entities/category.entity'
import { Type } from 'class-transformer'

export class UpdateProductDto {
  readonly name?: string
  readonly description?: string
  readonly price?: number
  @Type(() => Category)
  category?: Category
}

export type UpdatedProductDto = UpdateProductDto | { _id: ObjectId }
