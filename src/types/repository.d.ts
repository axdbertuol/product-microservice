import { ResultAsync } from 'neverthrow'
import { CRUD } from './base'

export interface ProductRepositoryInterface extends CRUD {
  findAllByCategory(id: string): ResultAsync<T[] | null>
}
