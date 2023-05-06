import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'
import { Product, ProductDocument } from '../entities/product.entity'
import { CreateProductDto } from '../dto/create-product.dto'
import { ProductRepository } from './product.repository'
import { Category } from '../entities/category.entity'
import { UpdateProductDto } from '../dto/update-product.dto'

describe('ProductRepository', () => {
  let repository: ProductRepository
  let productModel: Model<ProductDocument>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: getModelToken(Product.name),
          useValue: {
            findById: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
      ],
    }).compile()
    repository = module.get<ProductRepository>(ProductRepository)
    productModel = module.get<Model<ProductDocument>>(
      getModelToken(Product.name),
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('find', () => {
    it('should call findById on productModel with the given id', async () => {
      const id = 'id-123'
      const expectedProduct = new Product()
      // const findById = productModel.findById(id).exec as jest.Mock
      productModel.findById = jest.fn().mockImplementation(() => ({
        exec: () => Promise.resolve(expectedProduct),
      }))
      productModel.findById
      const result = await repository.find(id)

      expect(productModel.findById).toHaveBeenCalledWith(id)
      expect(result).toEqual(expectedProduct)
    })

    it('should return null if the product is not found', async () => {
      const id = 'id-123'
      productModel.findById = jest
        .fn()
        .mockImplementation(() => ({ exec: () => null }))

      const result = await repository.find(id)

      expect(productModel.findById).toHaveBeenCalledWith(id)
      expect(result).toBeNull()
    })
  })

  describe('findAllByCategory', () => {
    it('should call find on productModel with the given category', async () => {
      const category = 'electronics'
      const p1 = new Product()
      const p2 = new Product()
      const p3 = new Product()
      p1.category = new Category()
      p2.category = new Category()
      p3.category = new Category()
      p1.category.name = category
      p2.category.name = 'bla'
      p3.category.name = category
      const expectedProducts = [p1, p3]

      productModel.find = jest.fn().mockImplementation(() => ({
        populate: () => ({
          exec: () => Promise.resolve(expectedProducts),
        }),
      }))

      const result = await repository.findAllByCategory(category)
      expect(productModel.find).toHaveBeenCalled()
      expect(result).toEqual(expectedProducts)
    })
  })

  describe('findAll', () => {
    it('should call find on productModel with no arguments', async () => {
      const expectedProducts = [new Product(), new Product()]

      productModel.find = jest.fn().mockImplementation(() => ({
        populate: () => ({
          exec: () => Promise.resolve(expectedProducts),
        }),
      }))

      const result = await repository.findAll()

      expect(productModel.find).toHaveBeenCalledWith()
      expect(result).toEqual(expectedProducts)
    })
  })

  describe('create', () => {
    it('should call create on productModel with the given product', async () => {
      const product: CreateProductDto = {
        name: 'Product 1',
        price: 9.99,
        category: new Category(),
      }
      const expectedProduct = new Product()
      expectedProduct.name = product.name
      expectedProduct.price = product.price
      expectedProduct.category = product.category

      productModel.create = jest.fn().mockImplementation(() => ({
        save: () => Promise.resolve(expectedProduct),
      }))

      const result = await repository.create(product)

      expect(productModel.create).toHaveBeenCalledWith(product)
      expect(result).toEqual(expectedProduct)
    })
  })

  describe('update', () => {
    it('should call findByIdAndUpdate on productModel with the given id and product', async () => {
      const id = 'id-123'
      const product: UpdateProductDto = {
        name: 'Product 1',
        price: 9.99,
      }
      const expectedProduct = new Product()
      expectedProduct.name = product.name as string
      expectedProduct.price = product.price as number

      productModel.findByIdAndUpdate = jest.fn().mockImplementation(() => ({
        exec: () => Promise.resolve(expectedProduct),
      }))

      const result = await repository.update(id, product as Product)

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(id, product, {
        new: true,
      })
      expect(result).toEqual(expectedProduct)
    })
  })
})
