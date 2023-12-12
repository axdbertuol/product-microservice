import { HttpStatus } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model, ObjectId } from 'mongoose'
import {
  CreateProductDto,
  CreatedProductDto,
} from '../../dto/create-product.dto'
import { FoundProductDto } from '../../dto/find-product.dto'
import {
  UpdateProductDto,
  UpdatedProductDto,
} from '../../dto/update-product.dto'
import { Category, CategoryDocument } from '../../entities/category.entity'
import { Product, ProductDocument } from '../../entities/product.entity'
import { KBaseException } from '../../filters/exceptions/base-exception'
import { ProductRepository } from '../../repository/product.repository'
import { Subscription } from 'rxjs'

describe('ProductRepository', () => {
  let repository: ProductRepository
  let productModel: Model<ProductDocument>
  const wrap = (cat: any) =>
    ({
      toJSON: () => cat,
    } as unknown as ProductDocument)
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: getModelToken(Product.name),
          useValue: Model,
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
    let findSubscription: Subscription = new Subscription()
    afterEach(() => {
      findSubscription.unsubscribe()
    })
    it('should find a product by id and return a FindProductDto', (done) => {
      const mockProduct = {
        toJSON: () => ({
          _id: 'mockId',
          name: 'Mock Product',
          category: { name: 'x', _id: 'xasf' } as unknown as CategoryDocument,
        }),
      } as unknown as ProductDocument
      jest.spyOn(productModel, 'findById').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockProduct),
      } as any)

      const expectedResult: FoundProductDto = {
        _id: 'mockId',
        name: 'Mock Product',
        category: 'x',
        // Other properties
      }

      findSubscription = repository.find('mockId').subscribe({
        next: (result) => {
          expect(result).toEqual({ ...expectedResult })
          done()
        },
        error: done.fail,
      })
    })

    it('should return null if no product is found', (done) => {
      jest.spyOn(productModel, 'findById').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any)

      findSubscription = repository.find('mockId').subscribe({
        next: (result) => {
          expect(result).toBeNull()
          done()
        },
        error: done.fail,
      })
    })

    it('should throw an error if there is a database error', (done) => {
      const databaseError = new Error('Database error')

      jest.spyOn(productModel, 'findById').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValueOnce(databaseError),
      } as any)

      findSubscription = repository.find('mockId').subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(Error)
          expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
          done()
        },
        complete: done.fail,
      })
    })
  })

  describe('findAllByCategory', () => {
    let findSubscription: Subscription = new Subscription()
    afterEach(() => {
      findSubscription.unsubscribe()
    })
    it('should find all products by category and return an array of FindProductDto', (done) => {
      findSubscription.unsubscribe()
      const category = new Category() as Category & { _id: ObjectId }
      category.name = 'mockCategory'
      category._id = '213' as unknown as ObjectId
      const mockProducts = [
        {
          _id: '1' as unknown as ObjectId,
          name: 'Product 1',
          category,
          price: 10,
        } as Product & {
          category: Category & { _id: ObjectId }
          _id: ObjectId
        },
        {
          _id: '2' as unknown as ObjectId,
          name: 'Product 2',
          category,
          price: 20,
        } as Product & {
          category: Category & { _id: ObjectId }
          _id: ObjectId
        },
      ]

      jest.spyOn(productModel, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce([
          {
            toJSON: () => mockProducts[0],
          } as unknown as ProductDocument,

          {
            toJSON: () => mockProducts[1],
          } as unknown as ProductDocument,
        ]),
      } as any)

      const expectedResult: FoundProductDto[] = [
        {
          _id: '1',
          name: 'Product 1',
          category: 'mockCategory',
          price: 10,
        },
        {
          _id: '2',
          name: 'Product 2',
          category: 'mockCategory',
          price: 20,
        },
      ]

      findSubscription = repository.findAllByCategory(category.name).subscribe({
        next: (result) => {
          expect(result).toEqual(expect.arrayContaining(expectedResult))
          done()
        },
        error: done.fail,
      })
    })

    it('should throw an error if there is a database error', (done) => {
      const category = 'mockCategory'
      const databaseError = new Error()

      jest.spyOn(productModel, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValueOnce(databaseError),
      } as any)

      findSubscription = repository.findAllByCategory(category).subscribe({
        error: (error) => {
          expect(error.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR)
          done()
        },
      })
    })
  })
  describe('findAll', () => {
    let findSubscription: Subscription = new Subscription()
    afterEach(() => {
      findSubscription.unsubscribe()
    })
    it('should find all products and return an array of FindProductDto', (done) => {
      findSubscription.unsubscribe()
      const category = new Category() as Category & { _id: ObjectId }
      category.name = 'mockCategory'
      category._id = '213' as unknown as ObjectId
      const mockProducts = [
        {
          _id: '1' as unknown as ObjectId,
          name: 'Product 1',
          category: category,
          price: 10,
        },
        {
          _id: '2' as unknown as ObjectId,
          name: 'Product 2',
          category: category,
          price: 20,
        },
      ]

      jest.spyOn(productModel, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce([
          {
            ...mockProducts[0],
            toJSON: () => mockProducts[0],
          } as unknown as ProductDocument,

          {
            ...mockProducts[1],
            toJSON: () => mockProducts[1],
          } as unknown as ProductDocument,
        ]),
      } as any)

      const expectedResult: FoundProductDto[] = [
        {
          _id: '1',
          name: 'Product 1',
          category: 'mockCategory',
          price: 10,
        },
        {
          _id: '2',
          name: 'Product 2',
          category: 'mockCategory',
          price: 20,
        },
      ]

      findSubscription = repository.findAll().subscribe({
        next: (result) => {
          expect(result).toEqual(expect.arrayContaining(expectedResult))

          done()
        },
        error: done.fail,
      })
    })

    it('should throw an error if there is a database error', (done) => {
      const databaseError = new Error()

      jest.spyOn(productModel, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValueOnce(databaseError),
      } as any)

      findSubscription = repository.findAll().subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(Error)
          expect(error.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR)
          done()
        },
        complete: done.fail,
      })
    })
  })

  describe('create', () => {
    it('should create a product and return a CreatedProductDto', (done) => {
      const createProductDto: CreateProductDto = {
        name: 'New Product',
        category: 'Category 1',
        price: 10,
      }

      const expectedResult: CreatedProductDto = {
        _id: 'mockId',
        name: 'New Product',
        category: 'Category 1',
        price: 10,
      }
      const wrapProduct = {
        ...expectedResult,
        toJSON: () => expectedResult,
      } as unknown as ProductDocument

      jest.spyOn(productModel, 'create').mockResolvedValueOnce([wrapProduct])

      repository.create(createProductDto).subscribe({
        next: (result) => {
          expect(result?.[0]).toEqual(expect.objectContaining(expectedResult))
          done()
        },
        error: done.fail,
      })
    })

    it('should throw error if there is a database error', (done) => {
      const createProductDto: CreateProductDto = {
        name: 'New Product',
        category: 'Category 1',
        price: 10,
      }

      const databaseError = new Error()

      jest
        .spyOn(productModel, 'create')
        .mockImplementationOnce(() => Promise.reject(databaseError))

      repository.create(createProductDto).subscribe({
        error: (error) => {
          expect(error.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR)
          done()
        },
        complete: done.fail,
      })
    })
  })

  describe('update', () => {
    it('should update a product and return an UpdateProductDto', (done) => {
      const id = 'mockId'
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        category: 'Category 1',
        price: 20,
      }

      const mockProduct = new Product() as Product & { _id: ObjectId }
      mockProduct._id = id as unknown as ObjectId
      mockProduct.name = 'Updated Product'
      mockProduct.category = {
        name: 'Category 1',
        _id: '2342' as unknown as ObjectId,
      } as unknown as Category & { _id: ObjectId }
      mockProduct.price = 20

      jest.spyOn(productModel, 'findByIdAndUpdate').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(wrap(mockProduct)),
      } as any)

      const expectedResult: UpdatedProductDto = {
        _id: id,
        name: 'Updated Product',
        category: 'Category 1',
        price: 20,
      }

      repository.update(id, updateProductDto as UpdateProductDto).subscribe({
        next: (result) => {
          expect(result).toEqual({ ...expectedResult })
          done()
        },
        error: done.fail,
      })
    })

    it('should throw an error if there is a database error', (done) => {
      const id = 'mockId'
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        category: 'Category 1',
        price: 20,
      }

      const databaseError = new Error()

      jest.spyOn(productModel, 'findByIdAndUpdate').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValueOnce(databaseError),
      } as any)

      repository.update(id, updateProductDto as UpdateProductDto).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(KBaseException)
          done()
        },
        complete: done.fail,
      })
    })
  })
  describe('delete', () => {
    it('should delete a product and return the deleted product DTO', (done) => {
      const id = 'mockId'

      const mockProduct = new Product() as Product & { _id: ObjectId }
      mockProduct._id = id as unknown as ObjectId
      mockProduct.name = 'Updated Product'
      mockProduct.category = {
        name: 'Category 1',
        _id: id as unknown as ObjectId,
      } as unknown as Category & { _id: ObjectId }
      mockProduct.price = 20
      const wrapProduct = {
        ok: true,
        value: {
          toJSON: () => mockProduct,
        },
      }

      jest.spyOn(productModel, 'findByIdAndDelete').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(wrapProduct),
      } as any)

      const expectedResult: UpdatedProductDto = {
        _id: id,
        name: 'Updated Product',
        category: 'Category 1',
        price: 20,
      }

      repository.delete(id).subscribe({
        next: (result) => {
          expect(result).toEqual(expect.objectContaining(expectedResult))
          done()
        },
        error: done.fail,
      })
    })
  })
})
