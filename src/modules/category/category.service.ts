import { HttpStatus, Injectable } from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import {
  CreateCategoryDto,
  CreatedCategoryDto,
} from '../../dto/create-category.dto'
import { FindCategoryDto, FoundCategoryDto } from '../../dto/find-category.dto'
import {
  UpdateCategoryDto,
  UpdatedCategoryDto,
} from '../../dto/update-category.dto'
import { Category } from './category.entity'
import {
  ERRORS,
  FROM,
  KBaseException,
} from '../../filters/exceptions/base-exception'
import { CategoryRepository } from './category.repository'
import { CRUD } from '../../types/base'

@Injectable()
export class CategoryService implements CRUD {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  find(value: string): Observable<FoundCategoryDto | null> {
    return this.categoryRepository.find(value)
  }

  findByName(
    categoryName: string | null,
  ): Observable<FoundCategoryDto[] | null> {
    return this.categoryRepository.findByName(categoryName)
  }

  findAll(name?: string): Observable<FindCategoryDto[] | null> {
    if (name) {
      return this.findByName(name)
    }
    return this.categoryRepository.findAll()
  }

  create(category: CreateCategoryDto): Observable<CreatedCategoryDto[] | null> {
    return this.categoryRepository.create(category)
  }

  update(
    id: string,
    category: UpdateCategoryDto,
  ): Observable<UpdatedCategoryDto | null> {
    const categoryToBeUpdated = category as Category
    return this.categoryRepository.update(id, categoryToBeUpdated)
  }

  delete(id: string): Observable<string> {
    return this.categoryRepository.delete(id).pipe(
      map((category) => {
        console.log('1dcsv', category)
        if (category) {
          return `category ${category._id}:${category.name} deleted`
        }
        throw new KBaseException(
          FROM.service,
          ERRORS.invalidOrUndefinedData,
          HttpStatus.UNPROCESSABLE_ENTITY,
          {
            path: 'category',
          },
        )
      }),
      catchError((err) => throwError(() => err)),
    )
  }
}
