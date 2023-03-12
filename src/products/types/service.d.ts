import { CRUD } from './base'

export interface ProductServiceInterface extends CRUD {
  findAllByCategory(id: string): Promise<T[]>
  findAll(category?: string)
}
