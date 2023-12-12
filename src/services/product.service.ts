import { HttpStatus, Injectable } from '@nestjs/common'
import { unionBy } from 'lodash'
import { ObjectId } from 'mongoose'
import { Observable, forkJoin, throwError } from 'rxjs'
import { catchError, map, mergeMap } from 'rxjs/operators'

import { CreateProductDto, CreatedProductDto } from '../dto/create-product.dto'
import { FoundCategoryDto } from '../dto/find-category.dto'
import { FoundProductDto } from '../dto/find-product.dto'
import { UpdateProductDto, UpdatedProductDto } from '../dto/update-product.dto'
import {
  ERRORS,
  FROM,
  KBaseException,
} from '../filters/exceptions/base-exception'
import { ProductRepository } from '../repository/product.repository'
import { ProductServiceInterface } from '../types/service'
import { CategoryService } from './category.service'

@Injectable()
export class ProductService implements ProductServiceInterface {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryService: CategoryService,
  ) {}

  find(value: string): Observable<FoundProductDto | null> {
    return this.productRepository.find(value)
  }

  findAllByCategory(category?: string): Observable<FoundProductDto[]> {
    if (!category || category.length === 0) {
      return throwError(() => {
        return new KBaseException(
          FROM.service,
          ERRORS.invalidOrUndefinedData,
          HttpStatus.UNPROCESSABLE_ENTITY,
          {
            path: 'category',
          },
        )
      })
    }
    return this.productRepository.findAllByCategory(category)
  }

  findAll(search?: string, category?: string): Observable<FoundProductDto[]> {
    if (category) {
      if (search) {
        return this.findAllByCategoryAndName(search, category)
      }
      return this.findAllByCategory(category)
    }
    // what if search is a category?
    if (search) {
      return forkJoin([
        this.productRepository.findAllByName(search),
        this.productRepository.findAllByCategory(search),
      ]).pipe(
        map(([resultByName, resultByCategory]) => {
          // Handle the merged results
          const result = unionBy(resultByName, resultByCategory, '_id')
          return result
        }),
        catchError((err) => throwError(() => err)),
      )
    }
    return this.productRepository
      .findAll()
      .pipe(catchError((err) => throwError(() => err)))
  }

  findAllByCategoryAndName(
    search: string,
    category: string,
  ): Observable<FoundProductDto[]> {
    return this.productRepository
      .findAllByCategoryAndName(search, category)
      .pipe(catchError((err) => throwError(() => err)))
  }

  favourite(
    productId: string,
    userId: ObjectId,
  ): Observable<string | UpdatedProductDto | null> {
    const product = {
      id: productId,
    } as UpdateProductDto
    return this.update(productId, product as UpdateProductDto, {
      newFavourite: userId,
    })
  }

  create(product: CreateProductDto): Observable<CreatedProductDto[] | null> {
    return this.categoryService.findByName(product.category).pipe(
      mergeMap((categories: FoundCategoryDto[] | null) => {
        if (!categories || categories?.length == 0) {
          throw new KBaseException(
            FROM.service,
            ERRORS.invalidOrUndefinedData,
            HttpStatus.UNPROCESSABLE_ENTITY,
            {
              path: 'category',
            },
          )
        }
        const id = categories?.at(0)?._id
        if (id) {
          const result = this.productRepository.create({
            ...product,
            category: id,
          })
          // this.rabbitMQProvider.sendMessage(result, 'product-creation-success')
          return result
        }
        throw new KBaseException(
          FROM.service,
          ERRORS.invalidOrUndefinedData,
          HttpStatus.BAD_REQUEST,
          {
            path: 'category',
          },
        )
      }),
      catchError((err) => throwError(() => err)),
    )
  }

  update(
    id: string,
    product: UpdateProductDto,
    { newFavourite }: { newFavourite?: ObjectId } = {},
  ): Observable<UpdatedProductDto | null> {
    if (product?.category) {
      return this.categoryService.findByName(product.category).pipe(
        mergeMap((foundData: FoundCategoryDto[] | null) => {
          if (!foundData || foundData.length === 0)
            throw new KBaseException(
              FROM.service,
              ERRORS.invalidOrUndefinedData,
              HttpStatus.UNPROCESSABLE_ENTITY,
              {
                path: 'category',
              },
            )
          return this.productRepository.update(
            id,
            {
              ...product,
              category: foundData?.[0]._id,
            },
            { newFavourite },
          )
        }),
        catchError((err: any) => {
          throw err
        }),
      )
    }
    return this.productRepository.update(id, product, {
      newFavourite,
    })
  }

  delete(id: string): Observable<string | null> {
    return this.productRepository.delete(id).pipe(
      map((deletedProduct) => {
        if (deletedProduct) {
          return `Product ${deletedProduct._id}:${deletedProduct.name} deleted`
        }
        return null
      }),
      catchError((err) => throwError(() => err)),
    )
  }
}
