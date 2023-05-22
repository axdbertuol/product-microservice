import { Injectable } from '@nestjs/common'
import { Product } from '../entities/product.entity'
import { CreateProductDto, CreatedProductDto } from '../dto/create-product.dto'
import { ProductRepository } from '../repository/product.repository'
import { UpdateProductDto } from '../dto/update-product.dto'
import { ProductServiceInterface } from '../types/service'
import { ResultAsync, errAsync } from 'neverthrow'
import { CategoryService } from './category.service'
import { FindProductDto } from '../dto/find-product.dto'
@Injectable()
export class ProductService implements ProductServiceInterface {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryService: CategoryService,
  ) {}

  find(id: string): ResultAsync<FindProductDto | null, Error> {
    return this.productRepository
      .find(id)
      .map((product) => product as unknown as FindProductDto)
      .mapErr((err) => err)
  }

  findAllByCategory(category?: string): ResultAsync<FindProductDto[], Error> {
    if (!category || category.length === 0) {
      return errAsync(new Error('Category name not provided'))
    }
    return this.productRepository
      .findAllByCategory(category)
      .map((product) => product)
      .mapErr((err) => err)
  }

  findAll(category?: string): ResultAsync<FindProductDto[], Error> {
    if (category) return this.findAllByCategory(category)
    return this.productRepository.findAll()
  }

  create(
    product: CreateProductDto,
  ): ResultAsync<CreatedProductDto | null, Error> {
    return this.categoryService
      .findByName(product.category)
      .andThen((categories) => {
        const id = categories.at(0)?._id
        if (id) {
          return this.productRepository.create({
            ...product,
            category: id,
          })
        }
        return errAsync(new Error('po'))
      })
  }
  update(
    id: string,
    product: UpdateProductDto,
  ): ResultAsync<UpdateProductDto | string | null, Error> {
    const productToBeUpdated = product as Product
    return this.productRepository
      .update(id, productToBeUpdated)
      .map((product) => {
        if (product) {
          return product
        }
        return 'Product not found'
      })
      .mapErr((err) => err)
  }

  delete(id: string): ResultAsync<string, Error> {
    return this.productRepository
      .delete(id)
      .map((product) => {
        if (product) {
          return `Product ${product._id}:${product.name} deleted`
        }
        return `Product not found`
      })
      .mapErr((err) => err)
  }
}
