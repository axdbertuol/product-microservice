import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model, ObjectId } from 'mongoose'
import { Product, ProductDocument } from '../../entities/product.entity'
import {
  CreateProductDto,
  CreatedProductDto,
} from '../../dto/create-product.dto'
import { ProductRepository } from '../../repository/product.repository'
import { Category } from '../../entities/category.entity'
import {
  UpdateProductDto,
  UpdatedProductDto,
} from '../../dto/update-product.dto'
import { FindProductDto } from '../../dto/find-product.dto'

describe('ProductRepository', () => {
  let repository: ProductRepository
  let productModel: Model<ProductDocument>

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
    it('should find a product by id and return a FindProductDto', (done) => {
      const mockProduct = new Product()
      mockProduct._id = 'mockId' as unknown as ObjectId
      mockProduct.name = 'Mock Product'

      jest.spyOn(productModel, 'findById').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockProduct),
      } as any)

      const expectedResult: FindProductDto = {
        _id: 'mockId',
        name: 'Mock Product',
        // Other properties
      }

      repository.find('mockId').subscribe({
        next: (result) => {
          expect(result).toEqual(expectedResult)
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

      repository.find('mockId').subscribe({
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

      repository.find('mockId').subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(Error)
          expect(error.message).toBe('Database error: ' + databaseError)
          done()
        },
        complete: done.fail,
      })
    })
  })

  describe('findAllByCategory', () => {
    it('should find all products by category and return an array of FindProductDto', (done) => {
      const category = 'mockCategory'
      const mockProducts: Product[] = [
        {
          _id: '1' as unknown as ObjectId,
          name: 'Product 1',
          category: 'mockCategory' as unknown as Category,
          price: 10,
          description: '',
        },
        {
          _id: '2' as unknown as ObjectId,
          name: 'Product 2',
          category: 'mockCategory' as unknown as Category,
          price: 20,
          description: '',
        },
      ]

      jest.spyOn(productModel, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockProducts),
      } as any)

      const expectedResult: FindProductDto[] = [
        {
          _id: '1',
          name: 'Product 1',
          category: 'mockCategory' as unknown as Category,
          price: 10,
          description: '',
        },
        {
          _id: '2',
          name: 'Product 2',
          category: 'mockCategory' as unknown as Category,
          price: 20,
          description: '',
        },
      ]

      repository.findAllByCategory(category).subscribe({
        next: (result) => {
          expect(result).toEqual(expectedResult)
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

      repository.findAllByCategory(category).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(Error)
          expect(error.message).toMatch(/Database error/i)
          done()
        },
        complete: done.fail,
      })
    })
  })
  describe('findAll', () => {
    it('should find all products and return an array of FindProductDto', (done) => {
      const mockProducts: Product[] = [
        {
          _id: '1' as unknown as ObjectId,
          name: 'Product 1',
          category: 'mockCategory' as unknown as Category,
          price: 10,
          description: '',
        },
        {
          _id: '2' as unknown as ObjectId,
          name: 'Product 2',
          category: 'mockCategory' as unknown as Category,
          price: 20,
          description: '',
        },
      ]

      jest.spyOn(productModel, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockProducts),
      } as any)

      const expectedResult: FindProductDto[] = [
        {
          _id: '1',
          name: 'Product 1',
          category: 'mockCategory' as unknown as Category,
          price: 10,
          description: '',
        },
        {
          _id: '2',
          name: 'Product 2',
          category: 'mockCategory' as unknown as Category,
          price: 20,
          description: '',
        },
      ]

      repository.findAll().subscribe({
        next: (result) => {
          expect(result).toEqual(expectedResult)
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

      repository.findAll().subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(Error)
          expect(error.message).toMatch(/Database error/i)
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

      const mockProduct: CreatedProductDto = {
        _id: 'mockId',
        ...createProductDto,
        category: 'Category 1' as unknown as Category,
      }
      const wrapProduct = {
        toObject: () => mockProduct,
      } as ProductDocument

      jest
        .spyOn(productModel, 'create')
        .mockReturnValueOnce(Promise.resolve([wrapProduct]))

      const expectedResult: CreatedProductDto = {
        _id: 'mockId',
        name: 'New Product',
        category: 'Category 1' as unknown as Category,
        price: 10,
      }

      repository.create(createProductDto).subscribe({
        next: (result) => {
          expect(result).toEqual([expectedResult])
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
          expect(error).toBeInstanceOf(Error)
          expect(error.message).toMatch(/Database error/i)
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
        category: 'Category 1' as unknown as Category,
        price: 20,
      }

      const mockProduct = new Product()
      const wrapProduct = {
        toObject: () => mockProduct,
      } as ProductDocument
      mockProduct._id = id as unknown as ObjectId
      mockProduct.name = 'Updated Product'
      mockProduct.category = 'Category 1' as unknown as Category
      mockProduct.price = 20

      jest.spyOn(productModel, 'findByIdAndUpdate').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(wrapProduct),
      } as any)

      const expectedResult: UpdatedProductDto = {
        _id: id as unknown as ObjectId,
        name: 'Updated Product',
        category: 'Category 1' as unknown as Category,
        price: 20,
      }

      repository.update(id, updateProductDto as UpdateProductDto).subscribe({
        next: (result) => {
          expect(result).toEqual(expectedResult)
          done()
        },
        error: done.fail,
      })
    })

    it('should throw an error if there is a database error', (done) => {
      const id = 'mockId'
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        category: 'Category 1' as unknown as Category,
        price: 20,
      }

      const databaseError = new Error()

      jest.spyOn(productModel, 'findByIdAndUpdate').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValueOnce(databaseError),
      } as any)

      repository.update(id, updateProductDto as Product).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(Error)
          expect(error.message).toMatch(/Database error/i)
          done()
        },
        complete: done.fail,
      })
    })
  })
  describe('delete', () => {
    it('should delete a product and return the deleted product DTO', (done) => {
      const id = 'mockId'

      const mockProduct = new Product()
      const wrapProduct = {
        toObject: () => mockProduct,
      } as ProductDocument
      mockProduct._id = id as unknown as ObjectId
      mockProduct.name = 'Updated Product'
      mockProduct.category = 'Category 1' as unknown as Category
      mockProduct.price = 20

      jest.spyOn(productModel, 'findByIdAndDelete').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(wrapProduct),
      } as any)

      const expectedResult: UpdatedProductDto = {
        _id: id as unknown as ObjectId,
        name: 'Updated Product',
        category: 'Category 1' as unknown as Category,
        price: 20,
      }

      repository.delete(id).subscribe({
        next: (result) => {
          expect(result).toEqual(expectedResult)
          done()
        },
        error: done.fail,
      })
    })
  })
})
