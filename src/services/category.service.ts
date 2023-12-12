import { HttpStatus, Injectable } from '@nestjs/common'
import { CRUD } from '../types/base.d'
import { CategoryRepository } from '../repository/category.repository'
import {
  CreateCategoryDto,
  CreatedCategoryDto,
} from '../dto/create-category.dto'
import { Category } from '../entities/category.entity'
import {
  UpdateCategoryDto,
  UpdatedCategoryDto,
} from '../dto/update-category.dto'
import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { FindCategoryDto } from '../dto/find-category.dto'
import {
  ERRORS,
  FROM,
  KBaseException,
} from 'src/filters/exceptions/base-exception'

@Injectable()
export class CategoryService implements CRUD {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  find(id: string): Observable<FindCategoryDto | null> {
    return this.categoryRepository.find(id).pipe(
      map((category) => category),
      catchError((err) => throwError(() => err)),
    )
  }

  findByName<T extends FindCategoryDto>(
    categoryName: string,
  ): Observable<FindCategoryDto[] | null> {
    return this.categoryRepository.findByName<T>(categoryName).pipe(
      map((categories) => categories),
      catchError((err) => throwError(() => err)),
    )
  }

  findAll(name?: string): Observable<FindCategoryDto[] | null> {
    if (name) {
      return this.findByName<FindCategoryDto>(name)
    }
    return this.categoryRepository.findAll().pipe(
      map((category) => category),
      catchError((err) => throwError(() => err)),
    )
  }

  create(category: CreateCategoryDto): Observable<CreatedCategoryDto[] | null> {
    return this.categoryRepository.create(category).pipe(
      map((category) => category),
      catchError((err) => throwError(() => err)),
    )
  }

  update(
    id: string,
    category: UpdateCategoryDto,
  ): Observable<UpdatedCategoryDto | null> {
    const categoryToBeUpdated = category as Category
    return this.categoryRepository.update(id, categoryToBeUpdated).pipe(
      map((category) => category),
      catchError((err) => throwError(() => err)),
    )
  }

  delete(id: string): Observable<string> {
    return this.categoryRepository.delete(id).pipe(
      map((category) => {
        if (category) {
          return `category ${category._id}:${category.name} deleted`
        }
        throw new KBaseException(
          FROM.service,
          ERRORS.invalidCat,
          HttpStatus.UNPROCESSABLE_ENTITY,
          'category',
        )
      }),
      catchError((err) => throwError(() => err)),
    )
  }
}
