export interface CRUD {
  find(id: string): ResultAsync<T, E>
  findAll(id: string): ResultAsync<T[], E>
  create(obj: T): ResultAsync<T, E>
  update(id: string, obj: T): ResultAsync<T, E>
  delete(id: string): ResultAsync<T, E>
}
