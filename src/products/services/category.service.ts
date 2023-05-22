import { Injectable } from '@nestjs/common'
import { CRUD } from '../types/base.d'
import { CategoryRepository } from '../repository/category.repository'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { Category } from '../entities/category.entity'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { ResultAsync, errAsync } from 'neverthrow'
import { FindCategoryDto } from '../dto/find-category.dto'

@Injectable()
export class CategoryService implements CRUD {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  exists(category?: string): ResultAsync<boolean, Error> {
    return this.categoryRepository
      .exists(category ?? '')
      .map((category) => Boolean(category?._id))
      .mapErr((err) => err)
  }

  find(id: string): ResultAsync<Category | null, Error> {
    return this.categoryRepository
      .find(id)
      .map((category) => category)
      .mapErr((err) => err)
  }
  findByName(categoryName: string): ResultAsync<FindCategoryDto[], Error> {
    return this.categoryRepository
      .findByName(categoryName)
      .map((categories) => categories)
      .mapErr((err) => err)
  }

  findAll(): ResultAsync<Category[], Error> {
    return this.categoryRepository
      .findAll()
      .map((category) => category)
      .mapErr((err) => err)
  }

  create(category: CreateCategoryDto): ResultAsync<Category, Error> {
    return this.categoryRepository
      .create(category)
      .map((category) => category)
      .mapErr((err) => err)
  }

  update(
    id: string,
    category: UpdateCategoryDto,
  ): ResultAsync<Category | null, Error> {
    const categoryToBeUpdated = category as Category
    return this.categoryRepository
      .update(id, categoryToBeUpdated)
      .map((category) => category)
      .mapErr((err) => err)
  }

  delete(id: string): ResultAsync<string, Error> {
    return this.categoryRepository
      .delete(id)
      .map((category) => {
        if (category) {
          return `category ${category._id}:${category.name} deleted`
        }
        return `category not found`
      })
      .mapErr((err) => err)
  }
}
