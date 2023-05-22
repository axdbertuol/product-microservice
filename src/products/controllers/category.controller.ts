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
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get(':id')
  find(@Param('id') id: string): Promise<Category | string | null> {
    return this.categoryService.find(id).unwrapOr('Something went wrong')
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() category: UpdateCategoryDto,
  ): Promise<Category | string | null> {
    return this.categoryService
      .update(id, category)
      .unwrapOr('Something went wrong')
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<boolean | string> {
    return this.categoryService.delete(id).unwrapOr('Something went wrong')
  }

  @Get()
  findAll(): Promise<Category[] | string> {
    return this.categoryService.findAll().unwrapOr('Something went wrong')
  }

  @Post()
  create(
    @Body(new ValidationPipe({ transform: true })) category: CreateCategoryDto,
  ): Promise<Category | string> {
    const result = this.categoryService
      .create(category)
      .unwrapOr('Something went wrong')
    return result
  }
}
