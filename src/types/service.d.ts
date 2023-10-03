import { CRUD } from './base'
import { Observable } from 'rxjs'

export interface ProductServiceInterface extends CRUD {
  findAllByCategory(id: string): Observable<T[]>
  findAll(category?: string)
  update(
    id: string,
    obj: T,
    { newFavourite }: { newFavourite?: ObjectId },
  ): Observable<T, E>
}
