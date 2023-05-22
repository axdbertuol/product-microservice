import { ResultAsync } from 'neverthrow'
import { CRUD } from './base'

export interface ProductServiceInterface extends CRUD {
  findAllByCategory(id: string): ResultAsync<T[], E>
  findAll(category?: string)
}
