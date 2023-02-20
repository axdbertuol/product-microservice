import { Category } from '../entities/category.entity'

export interface CreateProductDto {
  readonly name: string
  readonly description?: string
  readonly price: number
  readonly category: Category
}
