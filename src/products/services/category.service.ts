import { Injectable } from '@nestjs/common'
import { CRUD } from '../types/base.d'
import { CategoryRepository } from '../repository/category.repository'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { Category } from '../entities/category.entity'
import { UpdateCategoryDto } from '../dto/update-category.dto'

@Injectable()
export class CategoryService implements CRUD {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async find(id: string): Promise<Category | null> {
    return this.categoryRepository.find(id)
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.findAll()
  }

  async create(category: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.create(category)
  }

  async update(
    id: string,
    category: UpdateCategoryDto,
  ): Promise<Category | null> {
    const categoryToBeUpdated = category as Category
    return this.categoryRepository.update(id, categoryToBeUpdated)
  }

  async delete(id: string): Promise<void> {
    await this.categoryRepository.delete(id)
  }
}
