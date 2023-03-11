import { Test, TestingModule } from '@nestjs/testing'
import { ProductService } from './product.service'
import { ProductRepository } from '../repository/product.repository'
import { CreateProductDto } from '../dto/create-product.dto'
import { Product } from '../entities/product.entity'
import { Category } from '../entities/category.entity'

jest.mock('./repository/product.repository')
describe('ProductService', () => {
  let service: ProductService
  let repository: ProductRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService, ProductRepository],
    }).compile()

    service = module.get<ProductService>(ProductService)
    repository = module.get<ProductRepository>(ProductRepository)
  })

  describe('find', () => {
    it('should return a product by id', async () => {
      const result: Product = new Product()
      const id = '123'
      jest.spyOn(repository, 'find').mockResolvedValue(result)

      expect(await service.find(id)).toBe(result)
    })
  })

  describe('findAllByCategory', () => {
    it('should return an array of products by category', async () => {
      const result: Product[] = [new Product(), new Product()]
      const category = 'category'
      jest.spyOn(repository, 'findAllByCategory').mockResolvedValue(result)

      expect(await service.findAllByCategory(category)).toBe(result)
    })
  })

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result: Product[] = [new Product(), new Product()]
      jest.spyOn(repository, 'findAll').mockResolvedValue(result)

      expect(await service.findAll()).toBe(result)
    })
  })

  describe('create', () => {
    it('should create a product', async () => {
      const result: Product = new Product()
      const category: Category = new Category()
      const createProductDto: CreateProductDto = {
        name: 'a',
        description: 'v',
        price: 123,
        category,
      }
      jest.spyOn(repository, 'create').mockResolvedValue(result)

      expect(await service.create(createProductDto)).toBe(result)
    })
  })

  describe('update', () => {
    it('should update a product by id', async () => {
      const result: Product = new Product()
      const id = '123'
      const product: Product = new Product()
      jest.spyOn(repository, 'update').mockResolvedValue(result)

      expect(await service.update(id, product)).toBe(result)
    })
  })

  describe('delete', () => {
    it('should delete a product by id', async () => {
      const id = '123'
      jest.spyOn(repository, 'delete').mockResolvedValue()

      expect(await service.delete(id)).toBeUndefined()
    })
  })
})
