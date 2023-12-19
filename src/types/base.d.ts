export interface CRUD {
  find(id: string): Observable<T, E>
  findAll(id: string): Observable<T[], E>
  create(obj: T): Observable<T, E>
  update(id: string, obj: T): Observable<T, E>
  delete(id: string): Observable<T, E>
}
export type FindManyProductFilters = {
  name?: string
  description?: string
  price?: { min?: number; max?: number }
  category?: string
}

export type PaginatedResult<T> = {
  data: T
  page: number
  limit: number
  totalCount: number
}
