import { Category } from '../entities/category.entity'
import { Transform } from 'class-transformer'
import { IsString } from 'class-validator'
import { ObjectId } from 'mongoose'

export class FindProductDto {
  _id?: ObjectId
  name?: string
  description?: string
  price?: number
  category?: Category
}
