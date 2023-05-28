import { CRUD } from './base'
import { Observable } from 'rxjs'

export interface ProductServiceInterface extends CRUD {
  findAllByCategory(id: string): Observable<T[]>
  findAll(category?: string)
}
