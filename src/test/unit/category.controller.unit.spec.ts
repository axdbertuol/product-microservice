import { Test, TestingModule } from '@nestjs/testing'
import { CategoryController } from '../../controllers/category.controller'
import { CategoryService } from '../../services/category.service'
import { Category } from '../../entities/category.entity'
import { CreateCategoryDto } from '../../dto/create-category.dto'
import { UpdateCategoryDto } from '../../dto/update-category.dto'
import { CategoryRepository } from '../../repository/category.repository'

jest.mock('../../repository/category.repository')
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

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const result = [
        { id: '1', name: 'Category 1' },
        { id: '2', name: 'Category 2' },
      ] as unknown as Category[]
      jest.spyOn(categoryService, 'findAll').mockResolvedValue(result)

      expect(await controller.findAll()).toBe(result)
    })
  })

  describe('find', () => {
    it('should return a category with the specified id', async () => {
      const id = '1'
      const result = { id: '1', name: 'Category 1' } as unknown as Category
      jest.spyOn(categoryService, 'find').mockResolvedValue(result)

      expect(await controller.find(id)).toBe(result)
    })

    it('should return null if the category is not found', async () => {
      const id = '1'
      jest.spyOn(categoryService, 'find').mockResolvedValue(null)

      expect(await controller.find(id)).toBe(null)
    })
  })

  describe('create', () => {
    it('should create a new category', async () => {
      const category: CreateCategoryDto = { name: 'New Category' }
      const result = { id: '1', name: 'New Category' } as unknown as Category
      jest.spyOn(categoryService, 'create').mockResolvedValue(result)

      expect(await controller.create(category)).toBe(result)
    })
  })

  describe('update', () => {
    it('should update an existing category', async () => {
      const id = '1'
      const category: UpdateCategoryDto = { name: 'Updated Category' }
      const result = {
        id: '1',
        name: 'Updated Category',
      } as unknown as Category
      jest.spyOn(categoryService, 'update').mockResolvedValue(result)

      expect(await controller.update(id, category)).toBe(result)
    })

    it('should return null if the category is not found', async () => {
      const id = '1'
      const category: UpdateCategoryDto = { name: 'Updated Category' }
      jest.spyOn(categoryService, 'update').mockResolvedValue(null)

      expect(await controller.update(id, category)).toBe(null)
    })
  })

  describe('delete', () => {
    it('should delete an existing category', async () => {
      const id = '1'
      jest.spyOn(categoryService, 'delete').mockResolvedValue(undefined)

      expect(await controller.delete(id)).toBe(undefined)
    })
  })
})
