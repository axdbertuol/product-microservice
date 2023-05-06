import { Category } from '../entities/category.entity'
import { IsNotEmpty } from 'class-validator'

export class CreateProductDto {
  @IsNotEmpty()
  readonly name: string
  readonly description?: string
  readonly price: number
  readonly category: Category
}
