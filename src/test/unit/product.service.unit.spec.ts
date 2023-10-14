import { of, throwError } from 'rxjs'
import { Test } from '@nestjs/testing'
import { ProductService } from '../../services/product.service'
import { ProductRepository } from '../../repository/product.repository'
import { CategoryService } from '../../services/category.service'
import {
  CreateProductDto,
  CreatedProductDto,
} from '../../dto/create-product.dto'
import { FindProductDto } from '../../dto/find-product.dto'
import {
  UpdateProductDto,
  UpdatedProductDto,
} from '../../dto/update-product.dto'
import { Category } from 'src/entities/category.entity'
import { ObjectId } from 'mongoose'

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
    it('should return a product when found', (done) => {
      const productId = '123'
      const findProductDto: FindProductDto = {
        _id: productId,
        name: 'Product A',
        category: 'Category A' as unknown as Category,
      }
      jest.spyOn(productRepository, 'find').mockReturnValue(of(findProductDto))

      productService.find(productId).subscribe((result: FindProductDto) => {
        expect(result).toEqual(findProductDto)
        done()
      })
    })

    it('should return null when product not found', (done) => {
      const productId = '123'
      jest.spyOn(productRepository, 'find').mockReturnValue(of(null))

      productService.find(productId).subscribe((result: any) => {
        expect(result).toBeNull()
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const productId = '123'
      const error = new Error('Some error')
      jest
        .spyOn(productRepository, 'find')
        .mockReturnValue(throwError(() => error))

      productService.find(productId).subscribe({
        // next: () => {},
        error: (err) => {
          expect(err.message).toBe(error.message)
          done()
        },
      })
    })
  })

  describe('findAllByCategory', () => {
    it('should return an array of products when category is provided', (done) => {
      const category = 'Category A'
      const findProductDto: FindProductDto[] = [
        {
          _id: '1',
          name: 'Product A',
          category: category as unknown as Category,
        },
        {
          _id: '2',
          name: 'Product B',
          category: category as unknown as Category,
        },
      ]
      jest
        .spyOn(productRepository, 'findAllByCategory')
        .mockReturnValue(of(findProductDto))

      productService
        .findAllByCategory(category)
        .subscribe((result: FindProductDto[]) => {
          expect(result).toEqual(findProductDto)
          done()
        })
    })

    it('should throw an error when category is not provided', (done) => {
      jest
        .spyOn(productRepository, 'findAllByCategory')
        .mockReturnValue(
          throwError(() => new Error('Category name not provided')),
        )

      productService.findAllByCategory().subscribe({
        // next: () => {},
        error: (err) => {
          expect(err.message).toBe('Category name not provided')
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

      productService.findAllByCategory(category).subscribe({
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
    it('should return an array of products when category is provided', (done) => {
      const category = 'Category A'
      const search = ''
      const findProductDto: FindProductDto[] = [
        {
          _id: '1',
          name: 'Product A',
          category: category as unknown as Category,
        },
        {
          _id: '2',
          name: 'Product B',
          category: category as unknown as Category,
        },
      ]
      jest
        .spyOn(productRepository, 'findAllByCategory')
        .mockReturnValue(of(findProductDto))

      productService
        .findAll(search, category)
        .subscribe((result: FindProductDto[]) => {
          expect(result).toEqual(findProductDto)
          done()
        })
    })
    it('should return an array of products when name and category is provided', (done) => {
      const category = 'Category A'
      const search = 'Product A'
      const findProductDto: FindProductDto[] = [
        {
          _id: '1',
          name: 'Product A',
          category: category as unknown as Category,
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

      productService
        .findAll(search, category)
        .subscribe((result: FindProductDto[]) => {
          expect(result).toEqual(findProductDto)
          done()
        })
    })
    it('should return an array of products when name is provided', (done) => {
      const category = ''
      const search = 'Product'
      const findProductDto: FindProductDto[] = [
        {
          _id: '1',
          name: 'Product A',
          category: category as unknown as Category,
        },
        {
          _id: '2',
          name: 'Product B',
          category: category as unknown as Category,
        },
      ]
      jest
        .spyOn(productRepository, 'findAllByName')
        .mockReturnValue(of(findProductDto))
      jest.spyOn(productRepository, 'findAllByCategory').mockReturnValue(of([]))

      productService.findAll(search).subscribe((result: FindProductDto[]) => {
        expect(result).toEqual(findProductDto)
        done()
      })
    })

    it('should return all products when no arg is provided', (done) => {
      const findProductDto: FindProductDto[] = [
        {
          _id: '1',
          name: 'Product A',
          category: 'Category A' as unknown as Category,
        },
        {
          _id: '2',
          name: 'Product B',
          category: 'Category B' as unknown as Category,
        },
      ]
      jest
        .spyOn(productRepository, 'findAll')
        .mockReturnValue(of(findProductDto))

      productService.findAll().subscribe((result: FindProductDto[]) => {
        expect(result).toEqual(findProductDto)
        done()
      })
    })
    it('should return all products of category as search', (done) => {
      const findProductDto: FindProductDto[] = [
        {
          _id: '1',
          name: 'Product A',
          category: { name: 'dsad A', _id: '2' } as unknown as Category,
        },
        {
          _id: '2',
          name: 'Product B',
          category: { name: 'Category B', _id: '1' } as unknown as Category,
        },
      ]
      jest.spyOn(productRepository, 'findAllByName').mockReturnValue(of([]))
      jest
        .spyOn(productRepository, 'findAllByCategory')
        .mockReturnValue(of([findProductDto[0]]))

      productService
        .findAll('Category B')
        .subscribe((result: FindProductDto[]) => {
          expect(result).toEqual([findProductDto[0]])
          done()
        })
    })

    it('should throw an error when an error occurs', (done) => {
      const error = new Error('Some error')
      jest
        .spyOn(productRepository, 'findAll')
        .mockReturnValue(throwError(() => error))

      productService.findAll().subscribe({
        // () => {},
        error: (err: Error) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })

  describe('create', () => {
    it('should create a product when category is found', (done) => {
      const createProductDto: CreateProductDto = {
        name: 'Product A',
        category: 'Category A',
        price: 123,
      }
      const createdProductDto: CreatedProductDto = {
        _id: '1231',
        name: 'Product A',
        price: 123,
        category: 'Category A' as unknown as Category,
      }
      jest
        .spyOn(categoryService, 'findByName')
        .mockReturnValue(of([{ _id: '123', name: 'Category A' }]))
      jest
        .spyOn(productRepository, 'create')
        .mockReturnValue(of([createdProductDto]))

      productService
        .create(createProductDto)
        .subscribe((result: CreatedProductDto[]) => {
          expect(result).toEqual([createdProductDto])
          done()
        })
    })

    it('should throw an error when category is not found', (done) => {
      const createProductDto: CreateProductDto = {
        name: 'Product A',
        category: 'Category A',
        price: 123,
      }
      jest.spyOn(categoryService, 'findByName').mockReturnValue(of([]))

      productService.create(createProductDto).subscribe({
        // () => {},
        error: (err: Error) => {
          expect(err.message).toBe('Should create category first')
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

      productService.create(createProductDto).subscribe({
        // () => {},
        error: (err: Error) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })

  describe('update', () => {
    it('should update a product when found', (done) => {
      const productId = '123'
      const updateProductDto: UpdateProductDto = {
        name: 'Product A',
        category: 'Category A' as unknown as Category,
        price: 123,
      }
      const updatedProductDto: UpdatedProductDto = {
        _id: productId as unknown as ObjectId,
        name: 'Product A',
        category: 'Category A' as unknown as Category,
        price: 123,
      }
      jest
        .spyOn(productRepository, 'update')
        .mockReturnValue(of(updatedProductDto))

      productService.update(productId, updateProductDto).subscribe((result) => {
        expect(result).toEqual(updatedProductDto)
        done()
      })
    })

    it('should return "Product not found" when product not found', (done) => {
      const productId = '123'
      const updateProductDto: UpdateProductDto = {
        name: 'Product A',
        category: 'Category A' as unknown as Category,
      }
      jest.spyOn(productRepository, 'update').mockReturnValue(of(null))

      productService.update(productId, updateProductDto).subscribe((result) => {
        expect(result).toBe(null)
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const productId = '123'
      const updateProductDto: UpdateProductDto = {
        name: 'Product A',
        category: 'Category A' as unknown as Category,
      }
      const error = new Error('Some error')
      jest
        .spyOn(productRepository, 'update')
        .mockReturnValue(throwError(() => error))

      productService.update(productId, updateProductDto).subscribe({
        // () => {},
        error: (err: Error) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })

  describe('delete', () => {
    it('should delete a product when found', (done) => {
      const productId = '123'
      const deletedProduct = {
        _id: productId,
        name: 'Product A',
      }
      jest
        .spyOn(productRepository, 'delete')
        .mockReturnValue(of(deletedProduct))

      productService.delete(productId).subscribe((result: string) => {
        expect(result).toBe(
          `Product ${deletedProduct._id}:${deletedProduct.name} deleted`,
        )
        done()
      })
    })

    it('should return "Product not found" when product not found', (done) => {
      const productId = '123'
      jest.spyOn(productRepository, 'delete').mockReturnValue(of(null))

      productService.delete(productId).subscribe((result) => {
        expect(result).toBe(null)
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const productId = '123'
      const error = new Error('Some error')
      jest
        .spyOn(productRepository, 'delete')
        .mockReturnValue(throwError(() => error))

      productService.delete(productId).subscribe({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        error: (err: Error) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })
})
