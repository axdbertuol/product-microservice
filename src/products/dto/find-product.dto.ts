import { ObjectId } from 'mongoose'
import { Category } from '../entities/category.entity'
import { Expose, Exclude, Transform } from 'class-transformer'
import { IsString } from 'class-validator'

export class FindProductDto {
  @Transform((value) => value.toString())
  @IsString()
  _id?: string
  name?: string
  description?: string
  price?: number
  category?: Category
}
