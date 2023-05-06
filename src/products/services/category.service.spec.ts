import { Test, TestingModule } from '@nestjs/testing'
import { CategoryService } from './category.service'
import { CategoryRepository } from '../repository/category.repository'
import { Category } from '../entities/category.entity'
import mongoose from 'mongoose'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'

describe('CategoryService', () => {
  let categoryService: CategoryService
  let categoryRepository: CategoryRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: {
            find: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile()

    categoryService = module.get<CategoryService>(CategoryService)
    categoryRepository = module.get<CategoryRepository>(CategoryRepository)
  })

  describe('find', () => {
    it('should return a Category object', async () => {
      const expectedCategory: Category = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _id: new mongoose.Types.ObjectId('60a0c618610a5a2a98d1975f'),
        name: 'Category 1',
      }

      jest.spyOn(categoryRepository, 'find').mockResolvedValue(expectedCategory)

      const result = await categoryService.find('60a0c618610a5a2a98d1975f')

      expect(result).toEqual(expectedCategory)
    })

    it('should return null if the category does not exist', async () => {
      jest.spyOn(categoryRepository, 'find').mockResolvedValue(null)

      const result = await categoryService.find('60a0c618610a5a2a98d1975f')

      expect(result).toBeNull()
    })
  })
  describe('findAll', () => {
    it('should return an array of Category objects', async () => {
      const expectedCategories: Category[] = [
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          _id: new mongoose.Types.ObjectId('60a0c618610a5a2a98d1975f'),
          name: 'Category 1',
          description: 'Category 1 Description',
        },
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          _id: new mongoose.Types.ObjectId('60a0c618610a5a2a98d1975f'),
          name: 'Category 2',
          description: 'Category 2 Description',
        },
      ]

      jest
        .spyOn(categoryRepository, 'findAll')
        .mockResolvedValue(expectedCategories)

      const result = await categoryService.findAll()

      expect(result).toEqual(expectedCategories)
    })
  })
  describe('create', () => {
    it('should create a category', async () => {
      const category: CreateCategoryDto = { name: 'Test Category' }
      const createdCategory: Category = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _id: new mongoose.Types.ObjectId('60a0c618610a5a2a98d1975f'),
        name: 'Test Category',
      }
      jest
        .spyOn(categoryRepository, 'create')
        .mockResolvedValue(createdCategory)

      const result = await categoryService.create(category)
      expect(result).toEqual(createdCategory)
      expect(categoryRepository.create).toHaveBeenCalledWith(category)
    })
  })
  describe('update', () => {
    const mockCategory = new Category()
    mockCategory.name = 'Mock Category'

    it('should update a category', async () => {
      const mockUpdateDto: UpdateCategoryDto = {
        name: 'Updated Category',
      }
      const mockUpdatedCategory = new Category()
      mockUpdatedCategory.name = 'Updated Category'

      jest
        .spyOn(categoryRepository, 'update')
        .mockResolvedValue(mockUpdatedCategory)

      const result = await categoryService.update('1', mockUpdateDto)

      expect(result).toEqual(mockUpdatedCategory)
    })

    it('should return null if the category does not exist', async () => {
      jest.spyOn(categoryRepository, 'update').mockResolvedValue(null)

      const result = await categoryService.update('1', {} as UpdateCategoryDto)

      expect(result).toBeNull()
    })
  })
  describe('delete', () => {
    it('should call CategoryRepository.delete with the given id', async () => {
      const id = '60a54d933081fd5e4b6b34e2'
      await categoryService.delete(id)
      expect(categoryRepository.delete).toHaveBeenCalledWith(id)
    })
  })
})
