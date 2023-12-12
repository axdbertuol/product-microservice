import 'reflect-metadata'

import { Category } from '../entities/category.entity'
import { Transform, Type } from 'class-transformer'
import { IsString } from 'class-validator'
import { ObjectId } from 'mongoose'
export class FindProductDto {
  @Transform((value) => value.toString()) // Transform decorator to convert the value to string
  @IsString()
  id?: string
  name?: string
  description?: string
  price?: number
  @Type(() => Category)
  @Transform((cat) => cat.value.name)
  @IsString()
  category?: Category['name']
  favouritedBy?: ObjectId[]
}
