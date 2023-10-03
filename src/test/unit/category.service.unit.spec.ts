import { CategoryService } from '../../services/category.service'
import { CategoryRepository } from '../../repository/category.repository'
import { of, throwError } from 'rxjs'
import {
  CreateCategoryDto,
  CreatedCategoryDto,
} from '../../dto/create-category.dto'
import {
  UpdateCategoryDto,
  UpdatedCategoryDto,
} from '../../dto/update-category.dto'
import { FindCategoryDto } from '../../dto/find-category.dto'
import { Test } from '@nestjs/testing'

describe('CategoryService', () => {
  let categoryService: CategoryService
  let categoryRepository: CategoryRepository

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: {
            find: jest.fn(),
            findByName: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile()

    categoryService = moduleRef.get<CategoryService>(CategoryService)
    categoryRepository = moduleRef.get<CategoryRepository>(CategoryRepository)
  })

  describe('find', () => {
    it('should return the found category', (done) => {
      const id = '123'
      const findCategoryDto: FindCategoryDto = {
        name: 'Category A',
        _id: id,
      }
      jest
        .spyOn(categoryRepository, 'find')
        .mockReturnValue(of(findCategoryDto))

      categoryService.find(id).subscribe((result) => {
        expect(result).toEqual(findCategoryDto)
        done()
      })
    })

    it('should return null when category not found', (done) => {
      const id = '123'
      jest.spyOn(categoryRepository, 'find').mockReturnValue(of(null))

      categoryService.find(id).subscribe((result) => {
        expect(result).toBeNull()
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const id = '123'
      const error = new Error('Some error')
      jest
        .spyOn(categoryRepository, 'find')
        .mockReturnValue(throwError(() => error))

      categoryService.find(id).subscribe({
        // () => {},
        error: (err) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })

  describe('findByName', () => {
    it('should return the found categories', (done) => {
      const categoryName = 'Category A'
      const findCategoryDto: FindCategoryDto[] = [
        { name: 'Category A', _id: '1' },
        { name: 'Category A', _id: '2' },
      ]
      jest
        .spyOn(categoryRepository, 'findByName')
        .mockReturnValue(of(findCategoryDto))

      categoryService.findByName(categoryName).subscribe((result) => {
        expect(result).toEqual(findCategoryDto)
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const categoryName = 'Category A'
      const error = new Error('Some error')
      jest
        .spyOn(categoryRepository, 'findByName')
        .mockReturnValue(throwError(() => error))

      categoryService.findByName(categoryName).subscribe({
        // () => {},
        error: (err) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })

  describe('findAll', () => {
    it('should return all categories', (done) => {
      const findCategoryDto: FindCategoryDto[] = [
        { name: 'Category A', _id: '1' },
        { name: 'Category B', _id: '2' },
      ]
      jest
        .spyOn(categoryRepository, 'findAll')
        .mockReturnValue(of(findCategoryDto))

      categoryService.findAll().subscribe((result) => {
        expect(result).toEqual(findCategoryDto)
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const error = new Error('Some error')
      jest
        .spyOn(categoryRepository, 'findAll')
        .mockReturnValue(throwError(() => error))

      categoryService.findAll().subscribe({
        // () => {},
        error: (err) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })

  describe('create', () => {
    it('should create a new category', (done) => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Category A',
      }
      const createdCategoryDto: CreatedCategoryDto = {
        name: 'Category A',
        _id: '123',
      }
      jest
        .spyOn(categoryRepository, 'create')
        .mockReturnValue(of([createdCategoryDto]))

      categoryService.create(createCategoryDto).subscribe((result) => {
        expect(result).toEqual([createdCategoryDto])
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Category A',
      }
      const error = new Error('Some error')
      jest
        .spyOn(categoryRepository, 'create')
        .mockReturnValue(throwError(() => error))

      categoryService.create(createCategoryDto).subscribe({
        // () => {},
        error: (err) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })

  describe('update', () => {
    it('should update the category', (done) => {
      const id = '123'
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Category',
      }
      const updatedCategoryDto: UpdatedCategoryDto = {
        name: 'Updated Category',
        _id: '123',
      }
      jest
        .spyOn(categoryRepository, 'update')
        .mockReturnValue(of(updatedCategoryDto))

      categoryService.update(id, updateCategoryDto).subscribe((result) => {
        expect(result).toEqual(updatedCategoryDto)
        done()
      })
    })

    it('should return null when category not found', (done) => {
      const id = '123'
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Category',
      }
      jest.spyOn(categoryRepository, 'update').mockReturnValue(of(null))

      categoryService.update(id, updateCategoryDto).subscribe((result) => {
        expect(result).toBeNull()
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const id = '123'
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Category',
      }
      const error = new Error('Some error')
      jest
        .spyOn(categoryRepository, 'update')
        .mockReturnValue(throwError(() => error))

      categoryService.update(id, updateCategoryDto).subscribe({
        // () => {},
        error: (err) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })

  describe('delete', () => {
    it('should delete the category', (done) => {
      const id = '123'
      const deletedCategoryDto = {
        _id: '123',
        name: 'Category A',
      }
      jest
        .spyOn(categoryRepository, 'delete')
        .mockReturnValue(of(deletedCategoryDto))

      categoryService.delete(id).subscribe((result) => {
        expect(result).toBe(
          `category ${deletedCategoryDto._id}:${deletedCategoryDto.name} deleted`,
        )
        done()
      })
    })

    it('should return "category not found" when category not found', (done) => {
      const id = '123'
      jest.spyOn(categoryRepository, 'delete').mockReturnValue(of(null))

      categoryService.delete(id).subscribe((result) => {
        expect(result).toBe('category not found')
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const id = '123'
      const error = new Error('Some error')
      jest
        .spyOn(categoryRepository, 'delete')
        .mockReturnValue(throwError(() => error))

      categoryService.delete(id).subscribe({
        // () => {},
        error: (err) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })
})
