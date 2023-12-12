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
  HttpCode,
  HttpStatus,
  UseInterceptors,
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
import { ApiQuery } from '@nestjs/swagger'
import { FindCategoryDto } from '../dto/find-category.dto'
import { Observable } from 'rxjs'
import { CRUD } from '../types/base'
import { HttpExceptionFilter } from '../filters/http-exception.filter'
import { ApiTags } from '@nestjs/swagger'
import MongooseClassSerializerInterceptor from 'src/services/mongoose.interceptor'

@ApiTags('Categories')
@Controller({
  path: 'categories',
  version: '1',
})
@UseFilters(HttpExceptionFilter)
@UseInterceptors(MongooseClassSerializerInterceptor)
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

  @Put(':id')
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
    @Body(new ValidationPipe({ transform: true })) category: CreateCategoryDto,
  ): Observable<CreatedCategoryDto[] | null> {
    const result = this.categoryService.create(category)
    return result
  }
}
