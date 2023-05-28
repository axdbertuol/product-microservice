import { CRUD } from './base'

export interface ProductRepositoryInterface extends CRUD {
  findAllByCategory(id: string): Observable<T[] | null>
}
