import { Test, TestingModule } from '@nestjs/testing'
import { ProductController } from './product.controller'
import { ProductService } from '../services/product.service'
import { CreateProductDto } from '../dto/create-product.dto'
import { Product } from '../entities/product.entity'
import { Category } from '../entities/category.entity'
import { ProductRepository } from '../repository/product.repository'

jest.mock('../repository/product.repository')
describe('ProductController', () => {
  let controller: ProductController
  let productService: ProductService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [ProductService, ProductRepository],
    }).compile()

    controller = module.get<ProductController>(ProductController)
    productService = module.get<ProductService>(ProductService)
  })

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result: Product[] = [new Product(), new Product()]
      jest.spyOn(productService, 'findAll').mockResolvedValue(result)

      expect(await controller.findAll()).toBe(result)
    })
  })

  describe('find', () => {
    it('should return a product by id', async () => {
      const result: Product = new Product()
      const id = '123'
      jest.spyOn(productService, 'find').mockResolvedValue(result)

      expect(await controller.find(id)).toBe(result)
    })
  })

  describe('findAll with category', () => {
    it('should return an array of products by category', async () => {
      const result: Product[] = [new Product(), new Product()]
      const categoryName = 'category'
      jest.spyOn(productService, 'findAllByCategory').mockResolvedValue(result)

      expect(await controller.findAll(categoryName)).toBe(result)
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
      jest.spyOn(productService, 'create').mockResolvedValue(result)

      expect(await controller.create(createProductDto)).toBe(result)
    })
  })

  describe('update', () => {
    it('should update a product', async () => {
      const result: Product = new Product()
      const id = '123'
      const product: Product = new Product()
      jest.spyOn(productService, 'update').mockResolvedValue(result)

      expect(await controller.update(id, product)).toBe(result)
    })
  })

  describe('delete', () => {
    it('should delete a product', async () => {
      const id = '123'
      jest.spyOn(productService, 'delete').mockResolvedValue()

      expect(await controller.delete(id)).toBeUndefined()
    })
  })
})
