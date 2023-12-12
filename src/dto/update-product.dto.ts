import 'reflect-metadata'

import { ObjectId } from 'mongoose'
import { Expose, Transform } from 'class-transformer'
import { MinLength, ValidateIf } from 'class-validator'

export class UpdateProductDto {
  name?: string
  description?: string
  price?: number
  @ValidateIf((obj) => Boolean(obj.category))
  @MinLength(2, { message: 'Category should have at least 2 characters' })
  category?: string
  favouritedBy?: ObjectId[] | ObjectId
}

export class UpdatedProductDto {
  name?: string
  description?: string
  price?: number
  @Transform(({ obj }) => obj._id.toString())
  @Expose({ name: 'id' })
  _id!: string

  @Transform(({ value }) => value.name)
  category!: string
}
