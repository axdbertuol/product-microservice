import { IsNotEmpty, IsString, MinLength } from 'class-validator'
import { Expose, Transform, Type } from 'class-transformer'
import { Category } from '@/entities/category.entity'

export class CreateProductDto {
  @MinLength(2, { message: 'Name should have at least 2 characters' })
  @IsNotEmpty({ message: 'Name should have at least 2 characters' })
  readonly name!: string
  @MinLength(2, { message: 'Name should have at least 2 characters' })
  readonly description?: string
  @IsNotEmpty({ message: 'Price should be set' })
  readonly price!: number
  @IsNotEmpty({ message: 'Category should have at least 2 characters' })
  readonly category!: string
}

export class CreatedProductDto extends CreateProductDto {
  @Expose({ name: 'id' })
  @Transform(({ obj }) => {
    return obj._id.toString()
  })
  _id!: string
}
