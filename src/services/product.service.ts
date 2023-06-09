import { Injectable } from '@nestjs/common'
import { Product } from '../entities/product.entity'
import { CreateProductDto, CreatedProductDto } from '../dto/create-product.dto'
import { ProductRepository } from '../repository/product.repository'
import { UpdateProductDto, UpdatedProductDto } from '../dto/update-product.dto'
import { ProductServiceInterface } from '../types/service'
import { Observable, throwError } from 'rxjs'
import { catchError, map, mergeMap } from 'rxjs/operators'
import { CategoryService } from './category.service'
import { FindProductDto } from '../dto/find-product.dto'
import { RabbitMQProvider } from '../rabbitmq.provider'

@Injectable()
export class ProductService implements ProductServiceInterface {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryService: CategoryService,
    private readonly rabbitMQProvider: RabbitMQProvider,
  ) {}

  find(id: string): Observable<FindProductDto | null> {
    return this.productRepository.find(id).pipe(
      map((product) => product as unknown as FindProductDto),
      catchError((err) => throwError(() => new Error(err))),
    )
  }

  findAllByCategory(category?: string): Observable<FindProductDto[]> {
    if (!category || category.length === 0) {
      return throwError(() => new Error('Category name not provided'))
    }
    return this.productRepository
      .findAllByCategory(category)
      .pipe(catchError((err) => throwError(() => err)))
  }

  findAll(category?: string): Observable<FindProductDto[]> {
    if (category) {
      return this.findAllByCategory(category)
    }
    return this.productRepository
      .findAll()
      .pipe(catchError((err) => throwError(() => err)))
  }

  create(product: CreateProductDto): Observable<CreatedProductDto | null> {
    return this.categoryService.findByName(product.category).pipe(
      mergeMap((categories) => {
        if (categories && categories?.length == 0) {
          return throwError(() => new Error('Should create category first'))
        }
        const id = categories.at(0)?._id
        if (id) {
          return this.productRepository.create({
            ...product,
            category: id,
          })
        }
        return throwError(() => new Error('Category not found'))
      }),
      catchError((err) => throwError(() => err)),
      map((result) => {
        const channel = this.rabbitMQProvider.getChannel()
        const exchangeName = 'my_exchange'
        const routingKey = 'product_microservice_key'
        console.log('oei')
        channel
          .assertExchange(exchangeName, 'direct', { durable: true })
          .then(() => {
            console.log('publishing')
            channel.publish(exchangeName, routingKey, Buffer.from('oi'))
          })
        return result
      }),
    )
  }

  update(
    id: string,
    product: UpdateProductDto,
  ): Observable<UpdatedProductDto | string | null> {
    const productToBeUpdated = product as Product
    return this.productRepository.update(id, productToBeUpdated).pipe(
      map((updatedProduct) => {
        if (updatedProduct) {
          return updatedProduct
        }
        return 'Product not found'
      }),
      catchError((err) => throwError(() => err)),
    )
  }

  delete(id: string): Observable<string> {
    return this.productRepository.delete(id).pipe(
      map((deletedProduct) => {
        if (deletedProduct) {
          return `Product ${deletedProduct._id}:${deletedProduct.name} deleted`
        }
        return 'Product not found'
      }),
      catchError((err) => throwError(() => err)),
    )
  }
}
