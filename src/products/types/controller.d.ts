export interface ProductControllerInterface extends CRUD {
  findAllByCategory(id: string): Promise<T[] | null>
}
