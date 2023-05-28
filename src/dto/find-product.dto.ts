import { Category } from '../entities/category.entity'

export class FindProductDto {
  _id?: string
  name?: string
  description?: string
  price?: number
  category?: Category
}
