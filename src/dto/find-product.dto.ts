import 'reflect-metadata'

import { Expose, Transform } from 'class-transformer'
import { IsString } from 'class-validator'
import { ObjectId } from 'mongoose'
export class FindProductDto {
  @Transform((value) => value.toString()) // Transform decorator to convert the value to string
  @IsString()
  @Expose({ name: 'id' })
  _id?: string
  name?: string
  description?: string
  price?: number
  @IsString()
  category?: string
  favouritedBy?: ObjectId[]
}

export class FoundProductDto extends FindProductDto {
  @Expose({ name: 'id' })
  @Transform(({ obj }) => {
    return obj._id.toString()
  })
  _id!: string
  @Transform(({ obj, value }) => {
    const val =
      obj.category?.name ?? obj.category ?? value ?? value?.name ?? obj.category
    return val
  })
  @IsString()
  category?: string
}
