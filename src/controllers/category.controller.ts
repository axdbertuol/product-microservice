import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  ValidationPipe,
  Query,
  UseFilters,
} from '@nestjs/common'
import { CategoryService } from '../services/category.service'
import {
  CreateCategoryDto,
  CreatedCategoryDto,
} from '../dto/create-category.dto'
import {
  UpdateCategoryDto,
  UpdatedCategoryDto,
} from '../dto/update-category.dto'
import { FindCategoryDto } from '../dto/find-category.dto'
import { Observable } from 'rxjs'
import { CRUD } from '../types/base'
import { HttpExceptionFilter } from '../filters/http-exception.filter'

@Controller('categories')
@UseFilters(HttpExceptionFilter)
export class CategoryController implements CRUD {
  constructor(private readonly categoryService: CategoryService) {}

  @Get(':id')
  find(@Param('id') id: string): Observable<FindCategoryDto | null> {
    return this.categoryService.find(id)
  }

  @Get()
  findAll(@Query('name') name?: string): Observable<FindCategoryDto[] | null> {
    return this.categoryService.findAll(name)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() category: UpdateCategoryDto,
  ): Observable<UpdatedCategoryDto | string | null> {
    return this.categoryService.update(id, category)
  }

  @Delete(':id')
  delete(@Param('id') id: string): Observable<boolean | string> {
    return this.categoryService.delete(id)
  }

  @Post()
  create(
    @Body(new ValidationPipe({ transform: true })) category: CreateCategoryDto,
  ): Observable<CreatedCategoryDto[] | null> {
    const result = this.categoryService.create(category)
    return result
  }
}
