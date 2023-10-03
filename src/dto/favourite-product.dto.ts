import { IsNotEmpty } from 'class-validator'
import { ObjectId } from 'mongoose'

export class FavouriteProductDto {
  @IsNotEmpty()
  readonly productId: string
  @IsNotEmpty()
  readonly userId: ObjectId
}
