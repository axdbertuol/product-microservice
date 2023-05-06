export interface CRUD {
  find(id: string): Promise<T | null>
  findAll(id: string): Promise<T[] | null>
  create(obj: T): Promise<T | null>
  update(id: string, obj: T): Promise<T | null>
  delete(id: string): Promise<void>
}
