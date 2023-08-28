export interface CRUD {
  find(id: string): Observable<T, E>
  findAll(id: string): Observable<T[], E>
  create(obj: T): Observable<T, E>
  update(id: string, obj: T): Observable<T, E>
  delete(id: string): Observable<T, E>
}
export interface MessageContent {
  data: any
  filters?: string | string[]
  category?: string
}
