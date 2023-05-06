import { CRUD } from './base'

export interface ProductRepositoryInterface extends CRUD {
  findAllByCategory(id: string): Promise<T[] | null>
}
