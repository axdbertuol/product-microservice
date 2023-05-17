import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  ValidationPipe,
} from '@nestjs/common'
import { CRUD } from '../types/base.d'
import { CategoryService } from '../services/category.service'
import { Category } from '../entities/category.entity'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'

@Controller('categories')
export class CategoryController implements CRUD {
  constructor(private readonly categoryService: CategoryService) {}

  @Get(':id')
  find(@Param('id') id: string): Promise<Category | null> {
    return this.categoryService.find(id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() category: UpdateCategoryDto,
  ): Promise<Category | null> {
    const result = this.categoryService.update(id, category)
    return result
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.categoryService.delete(id)
  }

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoryService.findAll()
  }

  @Post()
  create(@Body() category: CreateCategoryDto): Promise<Category> {
    const result = this.categoryService.create(category)
    return result
  }
}
