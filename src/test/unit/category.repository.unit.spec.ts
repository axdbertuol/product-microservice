import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'
import {
  Category,
  CategoryDocument,
} from '../../products/entities/category.entity'
import { CreateCategoryDto } from '../../products/dto/create-category.dto'
import { CategoryRepository } from '../../products/repository/category.repository'

describe('CategoryRepository', () => {
  let repository: CategoryRepository
  let model: Model<CategoryDocument>

  const mockCategory: CategoryDocument = {
    _id: 'test_id',
    name: 'test_category',
  } as unknown as CategoryDocument

  const mockCategoryList: CategoryDocument[] = [
    mockCategory,
    {
      _id: 'test_id_2',
      name: 'test_category_2',
    } as unknown as CategoryDocument,
  ]

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryRepository,
        {
          provide: getModelToken(Category.name),
          useValue: {
            findById: jest.fn(() => ({
              exec: jest.fn().mockResolvedValueOnce(mockCategory),
            })),
            find: jest.fn(() => ({
              exec: jest.fn().mockResolvedValueOnce(mockCategoryList),
            })),
            create: jest.fn().mockResolvedValueOnce(mockCategory),
            findByIdAndUpdate: jest.fn(() => ({
              exec: jest.fn().mockResolvedValueOnce(mockCategory),
            })),
            findByIdAndDelete: jest.fn(),
          },
        },
      ],
    }).compile()

    repository = module.get<CategoryRepository>(CategoryRepository)
    model = module.get<Model<CategoryDocument>>(getModelToken(Category.name))
  })

  describe('find', () => {
    it('should return a category when given a valid id', async () => {
      const result = await repository.find('test_id')

      expect(result).toEqual(mockCategory)
      expect(model.findById).toHaveBeenCalledWith('test_id')
    })

    it('should return null when given an invalid id', async () => {
      model.findById = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValueOnce(null),
      }))

      const result = await repository.find('invalid_id')

      expect(result).toBeNull()
      expect(model.findById).toHaveBeenCalledWith('invalid_id')
    })
  })

  describe('findAll', () => {
    it('should return a list of categories', async () => {
      const result = await repository.findAll()

      expect(result).toEqual(mockCategoryList)
      expect(model.find).toHaveBeenCalled()
    })
  })

  describe('create', () => {
    it('should create a category', async () => {
      const categoryDto: CreateCategoryDto = { name: 'test_category' }
      const result = await repository.create(categoryDto)

      expect(result).toEqual(mockCategory)
      expect(model.create).toHaveBeenCalledWith(categoryDto)
    })
  })
  describe('update', () => {
    it('should update a category when given a valid id', async () => {
      const categoryToUpdate = { name: 'updated_category' } as Category

      await repository.update('123', categoryToUpdate)

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        categoryToUpdate,
        { new: true },
      )
    })

    it('should return null if category does not exist', async () => {
      model.findByIdAndUpdate = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValueOnce(null),
      }))

      const categoryToUpdate = { name: 'updated_category' } as Category
      const result = await repository.update('invalid_id', categoryToUpdate)
      expect(result).toBeNull()
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'invalid_id',
        categoryToUpdate,
        { new: true },
      )
    })
  })
})
