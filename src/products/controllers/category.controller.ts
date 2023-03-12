import { Controller, Get, Post, Body, Put, Delete, Param } from '@nestjs/common'
import { CRUD } from '../types/base.d'
import { CategoryService } from '../services/category.service'
import { Category } from '../entities/category.entity'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'

@Controller('categories')
export class CategoryController implements CRUD {
  constructor(private readonly categoryService: CategoryService) {}

  @Get(':id')
  async find(@Param('id') id: string): Promise<Category | null> {
    return this.categoryService.find(id)
  }

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll()
  }

  @Post()
  async create(@Body() category: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(category)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() category: UpdateCategoryDto,
  ): Promise<Category | null> {
    return this.categoryService.update(id, category)
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.categoryService.delete(id)
  }
}
