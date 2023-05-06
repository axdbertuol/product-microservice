import { Category } from '../entities/category.entity'

export class UpdateProductDto {
  readonly name?: string
  readonly description?: string
  readonly price?: number
  readonly category?: Category
}
