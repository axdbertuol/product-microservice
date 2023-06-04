import { Test, TestingModule } from '@nestjs/testing'
import { CategoryRepository } from '../../repository/category.repository'
import { getModelToken } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Category, CategoryDocument } from '../../entities/category.entity'
import {
  CreateCategoryDto,
  CreatedCategoryDto,
} from '../../dto/create-category.dto'
import { FindCategoryDto } from 'src/dto/find-category.dto'
import {
  UpdateCategoryDto,
  UpdatedCategoryDto,
} from 'src/dto/update-category.dto'

describe('CategoryRepository', () => {
  let repository: CategoryRepository
  let categoryModel: Model<CategoryDocument>
  const wrap = (cat: any) => ({
    toObject: () => cat,
  })
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryRepository,
        {
          provide: getModelToken(Category.name),
          useValue: Model,
        },
      ],
    }).compile()

    repository = module.get<CategoryRepository>(CategoryRepository)
    categoryModel = module.get<Model<CategoryDocument>>(
      getModelToken(Category.name),
    )
  })
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('find', () => {
    it('should find the category by id and return it', (done) => {
      const id = '123'
      const categoryDto: FindCategoryDto = {
        name: 'Category A',
        _id: id,
      }
      const wrapCategory = {
        toObject: () => categoryDto,
      }
      const findByIdSpy = jest.spyOn(categoryModel, 'findById')
      findByIdSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue(wrapCategory),
        populate: jest.fn().mockReturnThis(),
      } as any)

      repository.find(id).subscribe((result) => {
        expect(result).toEqual(categoryDto)
        expect(findByIdSpy).toHaveBeenCalledWith(id)
        done()
      })
    })

    it('should return null when category is not found', (done) => {
      const id = '123'
      const findByIdSpy = jest.spyOn(categoryModel, 'findById')
      findByIdSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn().mockReturnThis(),
      } as any)

      repository.find(id).subscribe((result) => {
        expect(result).toBeNull()
        expect(findByIdSpy).toHaveBeenCalledWith(id)
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const id = '123'
      const error = new Error('Some error')
      const findByIdSpy = jest.spyOn(categoryModel, 'findById')
      findByIdSpy.mockReturnValue({
        exec: jest.fn().mockRejectedValueOnce(error),
        populate: jest.fn().mockReturnThis(),
      } as any)

      repository.find(id).subscribe({
        // () => {},
        error: (err) => {
          expect(error).toBeInstanceOf(Error)
          expect(err.message).toContain(error.message)
          expect(findByIdSpy).toHaveBeenCalledWith(id)
          done()
        },
      })
    })
  })

  describe('findByName', () => {
    it('should find categories by name and return an array of them', (done) => {
      const categoryName = 'Category A'
      const wrap = (cat: any) => ({
        toObject: () => cat,
      })
      const categoryDto: FindCategoryDto[] = [
        { name: 'Category A', _id: '123' },
        { name: 'Category A', _id: '456' },
      ]

      const wrappedCategoryDto = categoryDto.map((cat) => wrap(cat))
      const findSpy = jest.spyOn(categoryModel, 'find')
      findSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue(wrappedCategoryDto),
      } as any)

      repository.findByName(categoryName).subscribe((result) => {
        expect(result).toEqual(categoryDto)
        expect(findSpy).toHaveBeenCalledWith({ name: categoryName })
        done()
      })
    })

    it('should return an empty array when no categories found', (done) => {
      const categoryName = 'Category A'
      const findSpy = jest.spyOn(categoryModel, 'find')
      findSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as any)

      repository.findByName(categoryName).subscribe((result) => {
        expect(result).toEqual([])
        expect(findSpy).toHaveBeenCalledWith({ name: categoryName })
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const categoryName = 'Category A'
      const error = new Error('Some error')
      const findSpy = jest.spyOn(categoryModel, 'find')
      findSpy.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      } as any)

      repository.findByName(categoryName).subscribe({
        // () => {},
        error: (err) => {
          expect(error).toBeInstanceOf(Error)
          expect(err.message).toContain(error.message)
          expect(findSpy).toHaveBeenCalledWith({ name: categoryName })
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
      const findSpy = jest.spyOn(categoryModel, 'find')

      findSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue(categoryDto.map(wrap)),
      } as any)

      repository.findAll().subscribe((result) => {
        expect(result).toEqual(categoryDto)
        expect(findSpy).toHaveBeenCalledWith()
        done()
      })
    })

    it('should return an empty array when no categories found', (done) => {
      const findSpy = jest.spyOn(categoryModel, 'find')
      findSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as any)

      repository.findAll().subscribe((result) => {
        expect(result).toEqual([])
        expect(findSpy).toHaveBeenCalledWith()
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const error = new Error('Some error')
      const findSpy = jest.spyOn(categoryModel, 'find')
      findSpy.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      } as any)

      repository.findAll().subscribe({
        // () => {},
        error: (err) => {
          expect(error).toBeInstanceOf(Error)
          expect(err.message).toContain(error.message)
          expect(findSpy).toHaveBeenCalledWith()
          done()
        },
      })
    })
  })

  describe('create', () => {
    it('should create a new category and return the created category', (done) => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'New Category',
      }
      const createdCategoryDto: CreatedCategoryDto = {
        name: 'New Category',
        _id: '123',
      }
      const wrapCateg = {
        toObject: () => createdCategoryDto,
      } as CategoryDocument
      const createSpy = jest.spyOn(categoryModel, 'create')
      createSpy.mockImplementationOnce(() => Promise.resolve(wrapCateg))

      repository.create(createCategoryDto).subscribe((result) => {
        expect(result).toEqual(createdCategoryDto)
        expect(createSpy).toHaveBeenCalledWith(createCategoryDto)
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'New Category',
      }

      const error = new Error('Some error')
      const createSpy = jest.spyOn(categoryModel, 'create')
      createSpy.mockImplementationOnce(() => Promise.reject(error))

      repository.create(createCategoryDto).subscribe({
        // () => {},
        error: (err) => {
          expect(error).toBeInstanceOf(Error)
          expect(err.message).toContain(error.message)
          expect(createSpy).toHaveBeenCalledWith(createCategoryDto)

          done()
        },
      })
    })
  })

  describe('update', () => {
    it('should update the category and return the updated category', (done) => {
      const id = '123'
      const updatedCategoryDto: UpdatedCategoryDto = {
        name: 'Updated Category',
        _id: id,
      }
      const category: UpdateCategoryDto = {
        name: 'Updated Category',
      }
      const findByIdAndUpdateSpy = jest.spyOn(
        categoryModel,
        'findByIdAndUpdate',
      )
      findByIdAndUpdateSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue(wrap(updatedCategoryDto)),
      } as any)

      repository.update(id, category as Category).subscribe((result) => {
        expect(result).toEqual(updatedCategoryDto)
        expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(id, category, {
          new: true,
        })
        done()
      })
    })

    it('should return null when category is not found', (done) => {
      const id = '123'
      const category: UpdateCategoryDto = {
        name: 'Updated Category',
      }
      const findByIdAndUpdateSpy = jest.spyOn(
        categoryModel,
        'findByIdAndUpdate',
      )
      findByIdAndUpdateSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any)

      repository.update(id, category as Category).subscribe((result) => {
        expect(result).toBeNull()
        expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(id, category, {
          new: true,
        })
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const id = '123'
      const category: UpdateCategoryDto = {
        name: 'Updated Category',
      }
      const error = new Error('Some error')
      const findByIdAndUpdateSpy = jest.spyOn(
        categoryModel,
        'findByIdAndUpdate',
      )
      findByIdAndUpdateSpy.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      } as any)

      repository.update(id, category as Category).subscribe({
        // () => {},
        error: (err) => {
          expect(error).toBeInstanceOf(Error)
          expect(err.message).toContain(error.message)
          expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(id, category, {
            new: true,
          })
          done()
        },
      })
    })
  })

  describe('delete', () => {
    it('should delete the category and return the deleted category', (done) => {
      const id = '123'
      const deletedCategoryDto = { _id: id, name: 'Category A' }
      const findByIdAndDeleteSpy = jest.spyOn(
        categoryModel,
        'findByIdAndDelete',
      )
      findByIdAndDeleteSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue(wrap(deletedCategoryDto)),
      } as any)

      repository.delete(id).subscribe((result) => {
        expect(result).toEqual(deletedCategoryDto)
        expect(findByIdAndDeleteSpy).toHaveBeenCalledWith(id)
        done()
      })
    })

    it('should return null when category is not found', (done) => {
      const id = '123'
      const findByIdAndDeleteSpy = jest.spyOn(
        categoryModel,
        'findByIdAndDelete',
      )
      findByIdAndDeleteSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any)

      repository.delete(id).subscribe((result) => {
        expect(result).toBeNull()
        expect(findByIdAndDeleteSpy).toHaveBeenCalledWith(id)
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const id = '123'
      const error = new Error('Some error')
      const findByIdAndDeleteSpy = jest.spyOn(
        categoryModel,
        'findByIdAndDelete',
      )
      findByIdAndDeleteSpy.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      } as any)

      repository.delete(id).subscribe({
        // () => {},
        error: (err) => {
          expect(error).toBeInstanceOf(Error)
          expect(err.message).toContain(error.message)
          expect(findByIdAndDeleteSpy).toHaveBeenCalledWith(id)
          done()
        },
      })
    })
  })
})
