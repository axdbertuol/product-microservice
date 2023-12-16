import { Test, TestingModule } from '@nestjs/testing'
import { of } from 'rxjs'
import { ProductController } from '../../modules/product/product.controller'
import {
  CreateProductDto,
  CreatedProductDto,
} from '../../dto/create-product.dto'
import { FoundProductDto } from '../../dto/find-product.dto'
import {
  UpdateProductDto,
  UpdatedProductDto,
} from '../../dto/update-product.dto'
import { ProductRepository } from '../../modules/product/product.repository'
import { CategoryService } from '../../modules/category/category.service'
import { ProductService } from '../../modules/product/product.service'

jest.mock('../../modules/product/product.repository')
jest.mock('../../modules/category/category.repository')
jest.mock('../../modules/category/category.service')
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
      const expectedResult: FoundProductDto[] = [
        { name: 'x', _id: 'x' },
        { name: 'y', _id: 'y' },
      ]
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
      const expectedResult: FoundProductDto = { name: 'x', _id: 'x' }
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
      const expectedResult: FoundProductDto[] = [
        { name: 'x', _id: 'x' },
        { name: 'y', _id: 'y' },
      ]
      const findAllByCategorySpy = jest
        .spyOn(productService, 'findAllByCategory')
        .mockReturnValue(of(expectedResult))
      const result = controller.findAll(categoryName)
      result.subscribe((value) => {
        expect(value).toMatchObject(expectedResult)
      })

      // Verifying that the method was called
      expect(findAllByCategorySpy).toHaveBeenCalledWith(categoryName)
    })
  })

  describe('create', () => {
    it('should create a product', async () => {
      const expectedResult: CreatedProductDto = {
        _id: 'whatever',
        name: 'a',
        description: 'v',
        price: 123,
        category: 'ble',
      }
      const createProductDto: CreateProductDto = {
        name: 'a',
        description: 'v',
        price: 123,
        category: 'ble',
      }
      const createSpy = jest
        .spyOn(productService, 'create')
        .mockReturnValue(of([expectedResult]))
      const result = controller.create(createProductDto)
      result.subscribe((value) => {
        expect(value).toMatchObject([expectedResult])
      })

      // Verifying that the method was called
      expect(createSpy).toHaveBeenCalledWith(createProductDto)
    })
  })

  describe('update', () => {
    it('should update a product', async () => {
      const id = 'whatever'
      const expectedResult: UpdatedProductDto = {
        _id: id,
        name: 'a',
        category: 'ble',
        description: 'v',
        price: 123,
      }
      const product: UpdateProductDto = {
        name: 'a',
        description: 'v',
        price: 123,
        category: 'ble',
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
