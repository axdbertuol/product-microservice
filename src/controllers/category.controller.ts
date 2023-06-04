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
import { CategoryService } from '../services/category.service'
import {
  CreateCategoryDto,
  CreatedCategoryDto,
} from '../dto/create-category.dto'
import {
  UpdateCategoryDto,
  UpdatedCategoryDto,
} from '../dto/update-category.dto'
import { FindCategoryDto } from 'src/dto/find-category.dto'
import { Observable } from 'rxjs'
import { CRUD } from 'src/types/base'

@Controller('categories')
export class CategoryController implements CRUD {
  constructor(private readonly categoryService: CategoryService) {}

  @Get(':id')
  find(@Param('id') id: string): Observable<FindCategoryDto | null> {
    return this.categoryService.find(id)
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
  ): Observable<CreatedCategoryDto | string> {
    const result = this.categoryService.create(category)
    return result
  }

  @Get()
  findAll(): Observable<FindCategoryDto[]> {
    return this.categoryService.findAll()
  }
}
