import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CRUD } from '../types/base.d'
import { Category, CategoryDocument } from '../entities/category.entity'
import { CreateCategoryDto } from '../dto/create-category.dto'

@Injectable()
export class CategoryRepository implements CRUD {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async find(id: string): Promise<Category | null> {
    return this.categoryModel.findById(id).exec()
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec()
  }

  async create(category: CreateCategoryDto): Promise<Category> {
    const newCategory = await this.categoryModel.create(category)
    return newCategory as Category
  }

  async update(id: string, category: Category): Promise<Category | null> {
    return this.categoryModel
      .findByIdAndUpdate(id, category, { new: true })
      ?.exec()
  }

  async delete(id: string): Promise<void> {
    await this.categoryModel.findByIdAndDelete(id).exec()
  }
}
