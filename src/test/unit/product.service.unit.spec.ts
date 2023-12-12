import { FoundCategoryDto } from '@/dto/find-category.dto'
import { HttpStatus } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Subscription, of, throwError } from 'rxjs'
import {
  CreateProductDto,
  CreatedProductDto,
} from '../../dto/create-product.dto'
import { FindProductDto, FoundProductDto } from '../../dto/find-product.dto'
import {
  UpdateProductDto,
  UpdatedProductDto,
} from '../../dto/update-product.dto'
import { ProductRepository } from '../../repository/product.repository'
import { CategoryService } from '../../services/category.service'
import { ProductService } from '../../services/product.service'
import { unionBy } from 'lodash'

describe('ProductService', () => {
  let productService: ProductService
  let productRepository: ProductRepository
  let categoryService: CategoryService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {
            find: jest.fn(),
            findAllByCategory: jest.fn(),
            findAllByCategoryAndName: jest.fn(),
            findAllByName: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CategoryService,
          useValue: {
            findByName: jest.fn(),
          },
        },
      ],
    }).compile()

    productService = moduleRef.get<ProductService>(ProductService)
    productRepository = moduleRef.get<ProductRepository>(ProductRepository)
    categoryService = moduleRef.get<CategoryService>(CategoryService)
  })
  describe('find', () => {
    let subscription: Subscription = new Subscription()
    afterEach(() => {
      subscription.unsubscribe()
    })
    it('should return a product when found', (done) => {
      const productId = '123'
      const findProductDto: FoundProductDto = {
        _id: productId,
        name: 'Product A',
        category: 'Category A' as string,
      }
      jest.spyOn(productRepository, 'find').mockReturnValue(of(findProductDto))

      subscription = productService.find(productId).subscribe({
        next: (result: FoundProductDto | null) => {
          expect(result).toEqual(findProductDto)
        },
        complete: () => {
          done()
        },
      })
    })

    it('should return null when product not found', (done) => {
      const productId = '123'
      jest.spyOn(productRepository, 'find').mockReturnValue(of(null))

      subscription = productService.find(productId).subscribe({
        next: (result: any) => {
          expect(result).toBeNull()
        },
        complete: () => {
          done()
        },
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const productId = '123'
      const error = new Error('Some error')
      jest
        .spyOn(productRepository, 'find')
        .mockReturnValue(throwError(() => error))
      const observer = {
        // next: () => {},
        error: (err: any) => {
          expect(err.message).toBe(error.message)
          done()
        },
      }
      subscription = productService.find(productId).subscribe(observer)
    })
  })

  describe('findAllByCategory', () => {
    let subscription: Subscription = new Subscription()
    afterEach(() => {
      subscription.unsubscribe()
    })
    it('should return an array of products when category is provided', (done) => {
      const category = 'Category A'
      const findProductDto: FoundProductDto[] = [
        {
          _id: '1',
          name: 'Product A',
          category: category as string,
        },
        {
          _id: '2',
          name: 'Product B',
          category: category as string,
        },
      ]
      jest
        .spyOn(productRepository, 'findAllByCategory')
        .mockReturnValue(of(findProductDto))

      subscription = productService.findAllByCategory(category).subscribe({
        next: (result: FindProductDto[]) => {
          expect(result).toEqual(findProductDto)
          done()
        },
      })
    })

    it('should throw an error when category is not provided', (done) => {
      jest
        .spyOn(productRepository, 'findAllByCategory')
        .mockReturnValue(
          throwError(() => new Error('Category name not provided')),
        )

      subscription = productService.findAllByCategory().subscribe({
        // next: () => {},
        error: (err) => {
          expect(err.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY)
          done()
        },
        complete: () => {
          done()
        },
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const category = 'Category A'
      const error = new Error('Some error')
      jest
        .spyOn(productRepository, 'findAllByCategory')
        .mockReturnValue(throwError(() => error))

      subscription = productService.findAllByCategory(category).subscribe({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        // () => {},
        error: (err: Error) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })

  describe('findAll', () => {
    let subscription: Subscription = new Subscription()
    afterEach(() => {
      subscription.unsubscribe()
    })
    it('should return an array of products when category is provided', (done) => {
      subscription.unsubscribe()
      const category = 'Category A'
      const search = ''
      const findProductDto: FoundProductDto[] = [
        {
          _id: '1',
          name: 'Product A',
          category: category as string,
        },
        {
          _id: '2',
          name: 'Product B',
          category: category as string,
        },
      ]
      jest
        .spyOn(productRepository, 'findAllByCategory')
        .mockReturnValue(of(findProductDto))

      subscription = productService.findAll(search, category).subscribe({
        next: (result: FindProductDto[]) => {
          expect(result).toEqual(findProductDto)
          done()
        },
        // error: done.fail,
      })
    })
    it('should return an array of products when name and category is provided', (done) => {
      const category = 'Category A'
      const search = 'Product A'
      const findProductDto: FoundProductDto[] = [
        {
          _id: '1',
          name: 'Product A',
          category: category as string,
        },
        // {
        //   _id: '2',
        //   name: 'Product B',
        //   category: category as unknown as Category,
        // },
      ]
      jest
        .spyOn(productRepository, 'findAllByCategoryAndName')
        .mockReturnValue(of(findProductDto))

      subscription = productService.findAll(search, category).subscribe({
        next: (result: FindProductDto[]) => {
          expect(result).toEqual(expect.arrayContaining(findProductDto))
          done()
        },
        // complete: () => {},
      })
    })
    it('should return an array of products when name is provided', (done) => {
      const category = 'xaxa'
      const search = 'Product'
      const resultByName: FoundProductDto[] = [
        {
          _id: '1',
          name: 'Product A',
          category: category as string,
        },
        {
          _id: '3',
          name: 'Product C',
          category: category as string,
        },
      ] // Add expected result here

      const resultByCategory: FoundProductDto[] = [
        {
          _id: '1',
          name: 'Product A',
          category: category as string,
        },
        {
          _id: '2',
          name: 'Product B',
          category: category as string,
        },
      ]
      const mergedResult: FoundProductDto[] = unionBy(
        resultByCategory,
        resultByName,
        '_id',
      )

      jest
        .spyOn(productRepository, 'findAllByName')
        .mockReturnValue(of(resultByName))
      jest
        .spyOn(productRepository, 'findAllByCategory')
        .mockReturnValue(of(resultByCategory))

      subscription = productService.findAll(search).subscribe({
        next: (result: FindProductDto[]) => {
          expect(result).toEqual(expect.arrayContaining(mergedResult))
        },
        complete: () => {
          done()
        },
      })
    })

    it('should return all products when no arg is provided', (done) => {
      const findProductDto: FoundProductDto[] = [
        {
          _id: '1',
          name: 'Product A',
          category: 'Category A' as string,
        },
        {
          _id: '2',
          name: 'Product B',
          category: 'Category B' as string,
        },
      ]
      jest
        .spyOn(productRepository, 'findAll')
        .mockReturnValue(of(findProductDto))

      subscription = productService.findAll().subscribe({
        next: (result: FindProductDto[]) => {
          expect(result).toEqual(findProductDto)
        },
        complete: () => {
          done()
        },
      })
    })
    it('should return all products of category as search', (done) => {
      const findProductDto: FoundProductDto[] = [
        {
          _id: '1',
          name: 'Product A',
          category: 'cat A',
        },
        {
          _id: '2',
          name: 'Product B',
          category: 'Category B',
        },
      ]
      jest.spyOn(productRepository, 'findAllByName').mockReturnValue(of([]))
      jest
        .spyOn(productRepository, 'findAllByCategory')
        .mockReturnValue(of([findProductDto[0]]))

      subscription = productService.findAll('Category B').subscribe({
        next: (result: FindProductDto[]) => {
          expect(result).toEqual([findProductDto[0]])
        },
        complete: () => {
          done()
        },
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const error = new Error('Some error')
      jest
        .spyOn(productRepository, 'findAll')
        .mockReturnValue(throwError(() => error))

      subscription = productService.findAll().subscribe({
        // () => {},
        error: (err: Error) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })

  describe('create', () => {
    let subscription: Subscription = new Subscription()
    afterEach(() => {
      subscription.unsubscribe()
    })
    it('should create a product when category is found', (done) => {
      subscription.unsubscribe()
      const createProductDto: CreateProductDto = {
        name: 'Product A',
        category: 'Category A',
        price: 123,
      }
      const createdProductDto: CreatedProductDto = {
        _id: '1231',
        name: 'Product A',
        price: 123,
        category: 'Category A',
      }
      jest
        .spyOn(categoryService, 'findByName')
        .mockReturnValue(of([{ _id: '123', name: 'Category A' }]))
      jest
        .spyOn(productRepository, 'create')
        .mockReturnValue(of([createdProductDto]))

      subscription = productService.create(createProductDto).subscribe({
        next: (result: CreatedProductDto[] | null) => {
          expect(result).toEqual([createdProductDto])
        },
        complete: () => {
          done()
        },
      })
    })

    it('should throw an error when category is not found', (done) => {
      const createProductDto: CreateProductDto = {
        name: 'Product A',
        category: 'Category A',
        price: 123,
      }
      jest.spyOn(categoryService, 'findByName').mockReturnValue(of([]))

      subscription = productService.create(createProductDto).subscribe({
        // () => {},
        error: (err) => {
          expect(err.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY)
          done()
        },
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const createProductDto: CreateProductDto = {
        name: 'Product A',
        category: 'Category A',
        price: 123,
      }
      const error = new Error('Some error')
      jest
        .spyOn(categoryService, 'findByName')
        .mockReturnValue(throwError(() => error))

      subscription = productService.create(createProductDto).subscribe({
        // () => {},
        error: (err: Error) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })

  describe('update', () => {
    let subscription: Subscription = new Subscription()
    afterEach(() => {
      subscription.unsubscribe()
    })
    it('should update a product when found', (done) => {
      subscription.unsubscribe()
      const productId = '123'
      const updateProductDto: UpdateProductDto = {
        name: 'Product A',
        category: 'Category A',
        price: 123,
      }
      const updatedProductDto: UpdatedProductDto = {
        _id: productId,
        name: 'Product A',
        category: 'Category A',
        price: 123,
      }

      jest
        .spyOn(categoryService, 'findByName')
        .mockReturnValue(
          of([{ name: 'Category A', _id: '234' } as FoundCategoryDto]),
        )
      jest
        .spyOn(productRepository, 'update')
        .mockReturnValue(of(updatedProductDto))

      subscription = productService
        .update(productId, updateProductDto)
        .subscribe({
          next: (result) => {
            expect(result).toEqual(updatedProductDto)
            done()
          },
        })
    })

    it('should throw an error when an error occurs', (done) => {
      const productId = '123'
      const updateProductDto: UpdateProductDto = {
        name: 'Product A',
        category: 'Category A',
      }
      const expectedResult = [
        {
          name: 'Category A',
          _id: '234',
        } as FoundCategoryDto,
      ]
      const error = new Error('Some error')
      jest
        .spyOn(categoryService, 'findByName')
        .mockReturnValue(of(expectedResult))
      jest
        .spyOn(productRepository, 'update')
        .mockReturnValue(throwError(() => error))

      subscription = productService
        .update(productId, updateProductDto)
        .subscribe({
          // () => {},
          error: (err: Error) => {
            expect(err).toBe(error)
            done()
          },
        })
    })
  })

  describe('delete', () => {
    let subscription: Subscription = new Subscription()
    afterEach(() => {
      subscription.unsubscribe()
    })
    it('should delete a product when found', (done) => {
      const productId = '123'
      const deletedProduct = {
        _id: productId,
        name: 'Product A',
      }
      jest
        .spyOn(productRepository, 'delete')
        .mockReturnValue(of(deletedProduct))

      subscription = productService.delete(productId).subscribe({
        next: (result: string | null) => {
          expect(result).toBe(
            `Product ${deletedProduct._id}:${deletedProduct.name} deleted`,
          )
        },
        complete: () => {
          done()
        },
      })
    })

    it('should return "Product not found" when product not found', (done) => {
      const productId = '123'
      jest.spyOn(productRepository, 'delete').mockReturnValue(of(null))

      subscription = productService.delete(productId).subscribe({
        next: (result) => {
          expect(result).toBe(null)
        },
        complete: () => {
          done()
        },
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const productId = '123'
      const error = new Error('Some error')
      jest
        .spyOn(productRepository, 'delete')
        .mockReturnValue(throwError(() => error))

      subscription = productService.delete(productId).subscribe({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        error: (err: Error) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })
})
