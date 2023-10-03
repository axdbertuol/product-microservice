import { Test, TestingModule } from '@nestjs/testing'
import { CategoryController } from '../../controllers/category.controller'
import { CategoryService } from '../../services/category.service'
import {
  CreateCategoryDto,
  CreatedCategoryDto,
} from '../../dto/create-category.dto'
import {
  UpdateCategoryDto,
  UpdatedCategoryDto,
} from '../../dto/update-category.dto'
import { FindCategoryDto } from '../../dto/find-category.dto'
import { of, throwError } from 'rxjs'
import { CategoryRepository } from '../../repository/category.repository'

jest.mock('../../repository/category.repository')
jest.mock('../../services/category.service')
describe('CategoryController', () => {
  let controller: CategoryController
  let categoryService: CategoryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [CategoryService, CategoryRepository],
    }).compile()

    controller = module.get<CategoryController>(CategoryController)
    categoryService = module.get<CategoryService>(CategoryService)
  })

  describe('find', () => {
    it('should return the found category', (done) => {
      const id = '123'
      const categoryDto: FindCategoryDto = {
        name: 'Category A',
        _id: id,
      }
      jest.spyOn(categoryService, 'find').mockReturnValue(of(categoryDto))

      controller.find(id).subscribe((result) => {
        expect(result).toEqual(categoryDto)
        done()
      })
    })

    it('should return null when category not found', (done) => {
      const id = '123'
      jest.spyOn(categoryService, 'find').mockReturnValue(of(null))

      controller.find(id).subscribe((result) => {
        expect(result).toBeNull()
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const id = '123'
      const error = new Error('Some error')
      jest
        .spyOn(categoryService, 'find')
        .mockReturnValue(throwError(() => error))

      controller.find(id).subscribe({
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
        _id: id,
      }
      jest
        .spyOn(categoryService, 'update')
        .mockReturnValue(of(updatedCategoryDto))

      controller.update(id, updateCategoryDto).subscribe((result) => {
        expect(result).toEqual(updatedCategoryDto)
        done()
      })
    })

    it('should return null when category not found', (done) => {
      const id = '123'
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Category',
      }
      jest.spyOn(categoryService, 'update').mockReturnValue(of(null))

      controller.update(id, updateCategoryDto).subscribe((result) => {
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
        .spyOn(categoryService, 'update')
        .mockReturnValue(throwError(() => error))

      controller.update(id, updateCategoryDto).subscribe({
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
      jest.spyOn(categoryService, 'delete').mockReturnValue(of('deleted'))

      controller.delete(id).subscribe((result) => {
        expect(result).toBe('deleted')
        done()
      })
    })

    it('should return false when category not found', (done) => {
      const id = '123'
      jest.spyOn(categoryService, 'delete').mockReturnValue(of('not deleted'))

      controller.delete(id).subscribe((result) => {
        expect(result).toBe('not deleted')
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const id = '123'
      const error = new Error('Some error')
      jest
        .spyOn(categoryService, 'delete')
        .mockReturnValue(throwError(() => error))

      controller.delete(id).subscribe({
        // () => {},
        error: (err) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })

  describe('findAll', () => {
    it('should return an array of categories', (done) => {
      const categoryDto: FindCategoryDto[] = [
        { name: 'Category A', _id: '123' },
        { name: 'Category B', _id: '456' },
      ]
      jest.spyOn(categoryService, 'findAll').mockReturnValue(of(categoryDto))

      controller.findAll().subscribe((result) => {
        expect(result).toEqual(categoryDto)
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const error = new Error('Some error')
      jest
        .spyOn(categoryService, 'findAll')
        .mockReturnValue(throwError(() => error))

      controller.findAll().subscribe({
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
        name: 'New Category',
      }
      const createdCategoryDto: CreatedCategoryDto = {
        name: 'New Category',
        _id: '123',
      }
      jest
        .spyOn(categoryService, 'create')
        .mockReturnValue(of([createdCategoryDto]))

      controller.create(createCategoryDto).subscribe((result) => {
        expect(result).toEqual([createdCategoryDto])
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'New Category',
      }
      const error = new Error('Some error')
      jest
        .spyOn(categoryService, 'create')
        .mockReturnValue(throwError(() => error))

      controller.create(createCategoryDto).subscribe({
        // () => {},
        error: (err) => {
          expect(err).toBe(error)
          done()
        },
      })
    })
  })
})
