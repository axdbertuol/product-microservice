import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import { Observable } from 'rxjs'
import {
  CreateCategoryDto,
  CreatedCategoryDto,
} from '../../dto/create-category.dto'
import { FindCategoryDto } from '../../dto/find-category.dto'
import {
  UpdateCategoryDto,
  UpdatedCategoryDto,
} from '../../dto/update-category.dto'
import { CRUD } from '../../types/base'
import { CategoryService } from './category.service'

@ApiTags('Categories')
@Controller({
  path: 'categories',
  version: '1',
})
export class CategoryController implements CRUD {
  constructor(private readonly categoryService: CategoryService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  find(@Param('id') id: string): Observable<FindCategoryDto | null> {
    return this.categoryService.find(id)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'name', required: false })
  findAll(@Query('name') name?: string): Observable<FindCategoryDto[] | null> {
    return this.categoryService.findAll(name)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() category: UpdateCategoryDto,
  ): Observable<UpdatedCategoryDto | string | null> {
    return this.categoryService.update(id, category)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string): Observable<boolean | string> {
    return this.categoryService.delete(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() category: CreateCategoryDto,
  ): Observable<CreatedCategoryDto[] | null> {
    const result = this.categoryService.create(category)
    return result
  }
}
