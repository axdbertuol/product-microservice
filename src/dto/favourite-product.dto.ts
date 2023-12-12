import { IsNotEmpty } from 'class-validator'
import type { ObjectId } from 'mongoose'

export class FavouriteProductDto {
  @IsNotEmpty()
  readonly productId!: string
  @IsNotEmpty()
  readonly userId!: ObjectId
}
