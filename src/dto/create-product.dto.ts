import { IsNotEmpty, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateProductDto {
  @MinLength(2, { message: 'Name should have at least 2 characters' })
  @IsNotEmpty({ message: 'Name should have at least 2 characters' })
  readonly name: string
  @MinLength(2, { message: 'Name should have at least 2 characters' })
  readonly description?: string
  @IsNotEmpty({ message: 'Price should be set' })
  readonly price: number
  @IsNotEmpty({ message: 'Category should have at least 2 characters' })
  readonly category: string
}

export class CreatedProductDto {
  _id: string
  name: string
  description?: string
  price: number
  @Transform(({ value, obj }) => {
    console.log('aqweuhfd', value, obj)
    return obj.category
  })
  category: string
}
