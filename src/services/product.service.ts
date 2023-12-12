import { HttpStatus, Injectable } from '@nestjs/common'
import { ObjectId } from 'mongoose'
import { unionBy } from 'lodash'
import { Observable, forkJoin, throwError } from 'rxjs'
import { catchError, map, mergeMap } from 'rxjs/operators'

import { CreateProductDto, CreatedProductDto } from '../dto/create-product.dto'
import { ProductRepository } from '../repository/product.repository'
import { UpdateProductDto, UpdatedProductDto } from '../dto/update-product.dto'
import { ProductServiceInterface } from '../types/service'
import { CategoryService } from './category.service'
import { FindProductDto } from '../dto/find-product.dto'
import { FindCategoryDto } from 'src/dto/find-category.dto'
import {
  KBaseException,
  FROM,
  ERRORS,
} from 'src/filters/exceptions/base-exception'

@Injectable()
export class ProductService implements ProductServiceInterface {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryService: CategoryService,
  ) {}

  find(id: string): Observable<FindProductDto | null> {
    return this.productRepository.find(id).pipe(
      map((product) => product as FindProductDto),
      catchError((err) => throwError(() => err)),
    )
  }

  findAllByCategory(category?: string): Observable<FindProductDto[]> {
    if (!category || category.length === 0) {
      return throwError(() => {
        return new KBaseException(
          FROM.service,
          ERRORS.invalidCat,
          HttpStatus.UNPROCESSABLE_ENTITY,
          'category',
        )
      })
    }
    return this.productRepository
      .findAllByCategory(category)
      .pipe(catchError((err) => throwError(() => err)))
  }

  findAll(search?: string, category?: string): Observable<FindProductDto[]> {
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
  ): Observable<FindProductDto[]> {
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
      mergeMap((categories) => {
        if (!categories || categories?.length == 0) {
          throw new KBaseException(
            FROM.service,
            ERRORS.invalidCat,
            HttpStatus.UNPROCESSABLE_ENTITY,
            'category',
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
          ERRORS.invalidCat,
          HttpStatus.BAD_REQUEST,
          'category',
        )
      }),
      catchError((err) => throwError(() => err)),
    )
  }

  update(
    id: string,
    product: any,
    { newFavourite }: { newFavourite?: ObjectId } = {},
  ): Observable<UpdatedProductDto | null> {
    console.log(product)
    if (product?.category) {
      return this.categoryService.findByName(product.category).pipe(
        mergeMap((foundData: FindCategoryDto[]) => {
          if (!foundData || foundData.length === 0)
            throw new KBaseException(
              FROM.service,
              ERRORS.invalidCat,
              HttpStatus.UNPROCESSABLE_ENTITY,
              'category',
            )
          return this.productRepository.update(
            id,
            {
              ...product,
              category: foundData[0]._id.toString(),
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
