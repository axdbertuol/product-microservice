import { CRUD } from './base'

export interface ProductRepositoryInterface extends CRUD {
  findAllByCategory(id: string): Observable<T[] | null>
  update(
    id: string,
    obj: T,
    { newFavourite }: { newFavourite?: ObjectId },
  ): Observable<T, E>
}
