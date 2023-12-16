import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model, ObjectId } from 'mongoose'
import { Subscription } from 'rxjs'
import {
  UpdateCategoryDto,
  UpdatedCategoryDto,
} from 'src/dto/update-category.dto'
import {
  CreateCategoryDto,
  CreatedCategoryDto,
} from '../../dto/create-category.dto'
import {
  Category,
  CategoryDocument,
} from '../../modules/category/category.entity'
import { KBaseException } from '../../filters/exceptions/base-exception'
import { CategoryRepository } from '../../modules/category/category.repository'

describe('CategoryRepository', () => {
  let repository: CategoryRepository
  let categoryModel: Model<CategoryDocument>
  const wrap = (cat: any) =>
    ({
      ...cat,
      toJSON: () => cat,
    } as unknown as CategoryDocument)
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
    let findSubscription: Subscription = new Subscription()
    afterEach(() => {
      findSubscription.unsubscribe()
    })
    it('should find the category by id and return it', (done) => {
      const id = '5f082780b00cc7401fb8e8fc'
      const categoryDto: Category & { _id: ObjectId } = {
        name: 'Category A',
        _id: id as unknown as ObjectId,
      }
      const wrapCategory = wrap(categoryDto)

      const findByIdSpy = jest.spyOn(categoryModel, 'findOne')
      findByIdSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue(wrapCategory),
        populate: jest.fn().mockReturnThis(),
      } as any)

      findSubscription = repository.find(id).subscribe((result) => {
        expect(result).toEqual(categoryDto)
        expect(findByIdSpy).toHaveBeenCalledWith({ _id: id })
        done()
      })
    })

    it('should find the category by name and return it', (done) => {
      const id = '123'
      const categoryDto: Category & { _id: ObjectId } = {
        name: 'Category A',
        _id: id as unknown as ObjectId,
      }
      const wrapCategory = wrap(categoryDto)

      const findByIdSpy = jest.spyOn(categoryModel, 'findOne')
      findByIdSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue(wrapCategory),
        populate: jest.fn().mockReturnThis(),
      } as any)

      findSubscription = repository.find(id).subscribe((result) => {
        expect(result).toEqual(categoryDto)
        expect(findByIdSpy).toHaveBeenCalledWith({ name: id })
        done()
      })
    })

    it('should return null when category is not found', (done) => {
      const id = '123'
      const findByIdSpy = jest.spyOn(categoryModel, 'findOne')
      findByIdSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn().mockReturnThis(),
      } as any)

      findSubscription = repository.find(id).subscribe((result) => {
        expect(result).toBeNull()
        expect(findByIdSpy).toHaveBeenCalledWith({ name: id })
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      const id = '123'
      const error = new Error('Some error')
      const findByIdSpy = jest.spyOn(categoryModel, 'findOne')
      findByIdSpy.mockReturnValue({
        exec: jest.fn().mockRejectedValueOnce(error),
        populate: jest.fn().mockReturnThis(),
      } as any)

      findSubscription = repository.find(id).subscribe({
        // () => {},
        error: (err) => {
          expect(error).toBeInstanceOf(Error)
          expect(err.message).toContain(error.message)
          expect(findByIdSpy).toHaveBeenCalledWith({ name: id })
          done()
        },
      })
    })
  })

  describe('findByName', () => {
    let subscr: Subscription
    it('should find categories by name and return an array of them', (done) => {
      const categoryName = 'Category A'
      const wrap = (cat: any) => ({
        toJSON: () => cat,
      })
      const categoryDto = [
        { name: 'Category A', _id: '123' },
        { name: 'Category A', _id: '456' },
      ]

      const wrappedCategoryDto = categoryDto.map((cat) => wrap(cat))
      const findSpy = jest.spyOn(categoryModel, 'find')
      findSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue(wrappedCategoryDto),
      } as any)

      subscr = repository.findByName(categoryName).subscribe((result) => {
        expect(result).toEqual(categoryDto)
        expect(findSpy).toHaveBeenCalledWith({
          name: { $regex: categoryName, $options: 'i' },
        })
        done()
      })
    })

    it('should return an empty array when no categories found', (done) => {
      subscr.unsubscribe()
      const categoryName = 'Category A'
      const findSpy = jest.spyOn(categoryModel, 'find')
      findSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as any)

      subscr = repository.findByName(categoryName).subscribe((result) => {
        expect(result).toEqual([])
        expect(findSpy).toHaveBeenCalledWith({
          name: { $regex: categoryName, $options: 'i' },
        })
        done()
      })
    })

    it('should throw an error when an error occurs', (done) => {
      subscr.unsubscribe()
      const categoryName = 'Category A'
      const error = new Error('Some error')
      const findSpy = jest.spyOn(categoryModel, 'find')
      findSpy.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      } as any)

      subscr = repository.findByName(categoryName).subscribe({
        // () => {},
        next(value) {
          console.log('not here', value)
        },
        error: (err) => {
          expect(err).toBeInstanceOf(KBaseException)
          done()
        },
      })
    })
  })

  describe('findAll', () => {
    it('should return an array of categories', (done) => {
      const categoryDto = [
        { name: 'Category A', _id: '123' },
        { name: 'Category B', _id: '456' },
      ]
      const findSpy = jest.spyOn(categoryModel, 'find')

      findSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue(categoryDto.map((x) => wrap(x))),
      } as any)

      repository.findAll().subscribe({
        next: (result) => {
          expect(result).toEqual(categoryDto)
        },
        complete: () => {
          done()
        },
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
      const createCategoryDto = {
        name: 'New Category',
      }
      const createdCategoryDto: CreatedCategoryDto = {
        name: 'New Category',
        _id: '123',
      }
      const wrapCateg = {
        ...createdCategoryDto,
        toJSON: () => createdCategoryDto,
      } as unknown as CategoryDocument
      const createSpy = jest
        .spyOn(categoryModel, 'create')
        .mockResolvedValueOnce([wrapCateg])

      repository.create(createCategoryDto).subscribe((result) => {
        expect(result).toEqual([createdCategoryDto])
        expect(createSpy).toHaveBeenCalledWith([createCategoryDto])
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
          expect(createSpy).toHaveBeenCalledWith([createCategoryDto])

          done()
        },
      })
    })
  })

  describe('update', () => {
    it('should update the category and return the updated category', (done) => {
      const id = '123'
      const updatedCategoryDto: UpdatedCategoryDto = {
        name: 'Updated category',
        _id: id,
      }
      const category: Category & { _id: ObjectId } = {
        _id: 'sdafdsa' as unknown as ObjectId,
        name: 'Updated Category',
      }
      const findByIdAndUpdateSpy = jest.spyOn(
        categoryModel,
        'findByIdAndUpdate',
      )
      findByIdAndUpdateSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue(wrap(updatedCategoryDto)),
      } as any)

      repository.update(id, category).subscribe((result) => {
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
      const deletedCategoryDto = { _id: id, name: 'Category a' }
      const findByIdAndDeleteSpy = jest.spyOn(
        categoryModel,
        'findByIdAndDelete',
      )
      findByIdAndDeleteSpy.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ok: true,
          value: wrap(deletedCategoryDto),
        }),
      } as any)

      repository.delete(id).subscribe((result) => {
        expect(result).toEqual(deletedCategoryDto)
        expect(findByIdAndDeleteSpy).toHaveBeenCalledWith(id, {
          includeResultMetadata: true,
        })
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
        expect(findByIdAndDeleteSpy).toHaveBeenCalledWith(id, {
          includeResultMetadata: true,
        })
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
          expect(findByIdAndDeleteSpy).toHaveBeenCalledWith(id, {
            includeResultMetadata: true,
          })
          done()
        },
      })
    })
  })
})
