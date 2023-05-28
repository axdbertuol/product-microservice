import { Test, TestingModule } from '@nestjs/testing'
import { ProductController } from '../../controllers/product.controller'
import { ProductService } from '../../services/product.service'
import {
  CreateProductDto,
  CreatedProductDto,
} from '../../dto/create-product.dto'
import { Category } from '../../entities/category.entity'
import { ProductRepository } from '../../repository/product.repository'
import { FindProductDto } from '../../dto/find-product.dto'
import { of } from 'rxjs'
import {
  UpdateProductDto,
  UpdatedProductDto,
} from '../../dto/update-product.dto'
import { CategoryService } from '../../services/category.service'

jest.mock('../../repository/product.repository')
jest.mock('../../repository/category.repository')
jest.mock('../../services/category.service')
describe('ProductController', () => {
  let controller: ProductController
  let productService: ProductService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [ProductService, ProductRepository, CategoryService],
    }).compile()

    controller = module.get<ProductController>(ProductController)
    productService = module.get<ProductService>(ProductService)
  })

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const expectedResult: FindProductDto[] = [{ name: 'x' }, { name: 'y' }]
      const findAllSpy = jest
        .spyOn(productService, 'findAll')
        .mockReturnValue(of(expectedResult))
      const result = controller.findAll()
      result.subscribe((value) => {
        expect(value).toBe(expectedResult)
      })

      // Verifying that the method was called
      expect(findAllSpy).toHaveBeenCalled()
    })
  })

  describe('find', () => {
    it('should return a product by id', async () => {
      const expectedResult: FindProductDto = { name: 'x' }
      const findSpy = jest
        .spyOn(productService, 'find')
        .mockReturnValue(of(expectedResult))
      const result = controller.find('ble')
      result.subscribe((value) => {
        expect(value).toBe(expectedResult)
      })

      // Verifying that the method was called
      expect(findSpy).toHaveBeenCalledWith('ble')
    })
  })

  describe('findAll with category', () => {
    it('should return an array of products by category', async () => {
      const categoryName = 'category'
      const expectedResult: FindProductDto[] = [{ name: 'x' }, { name: 'y' }]
      const findAllByCategorySpy = jest
        .spyOn(productService, 'findAllByCategory')
        .mockReturnValue(of(expectedResult))
      const result = controller.findAll(categoryName)
      result.subscribe((value) => {
        expect(value).toBe(expectedResult)
      })

      // Verifying that the method was called
      expect(findAllByCategorySpy).toHaveBeenCalledWith(categoryName)
    })
  })

  describe('create', () => {
    it('should create a product', async () => {
      const category = { name: 'ble' } as Category
      const expectedResult: CreatedProductDto = {
        _id: 'whatever',
        name: 'a',
        description: 'v',
        price: 123,
        category,
      }
      const createProductDto: CreateProductDto = {
        name: 'a',
        description: 'v',
        price: 123,
        category: 'ble',
      }
      const createSpy = jest
        .spyOn(productService, 'create')
        .mockReturnValue(of(expectedResult))
      const result = controller.create(createProductDto)
      result.subscribe((value) => {
        expect(value).toBe(expectedResult)
      })

      // Verifying that the method was called
      expect(createSpy).toHaveBeenCalledWith(createProductDto)
    })
  })

  describe('update', () => {
    it('should update a product', async () => {
      const category = { name: 'ble' } as Category
      const id = 'whatever'
      const expectedResult: UpdatedProductDto = {
        name: 'a',
      }
      const product: UpdateProductDto = {
        name: 'a',
        description: 'v',
        price: 123,
        category,
      }
      const updateSpy = jest
        .spyOn(productService, 'update')
        .mockReturnValue(of(expectedResult))
      const result = controller.update(id, product)
      result.subscribe((value) => {
        expect(value).toBe(expectedResult)
      })

      // Verifying that the method was called
      expect(updateSpy).toHaveBeenCalledWith(id, product)
    })
  })

  describe('delete', () => {
    it('should delete a product', async () => {
      const id = '123'
      const expectedResult = `Product ${id}:bd deleted`
      const deleteSpy = jest
        .spyOn(productService, 'delete')
        .mockReturnValue(of(expectedResult))
      const result = controller.delete(id)

      result.subscribe((value) => {
        expect(value).toBe(expectedResult)
      })

      // Verifying that the method was called
      expect(deleteSpy).toHaveBeenCalledWith(id)
    })
  })
})
