import { Injectable } from '@nestjs/common'
import { Product } from '../entities/product.entity'
import { CreateProductDto } from '../dto/create-product.dto'
import { ProductRepository } from '../repository/product.repository'
import { UpdateProductDto } from '../dto/update-product.dto'
import { ProductServiceInterface } from '../types/service'

@Injectable()
export class ProductService implements ProductServiceInterface {
  constructor(private readonly productRepository: ProductRepository) {}

  async find(id: string): Promise<Product | null> {
    return this.productRepository.find(id)
  }

  async findAllByCategory(category: string): Promise<Product[]> {
    return this.productRepository.findAllByCategory(category)
  }

  async findAll(category?: string): Promise<Product[]> {
    if (category) return this.findAllByCategory(category)
    return this.productRepository.findAll()
  }

  async create(product: CreateProductDto): Promise<Product> {
    return this.productRepository.create(product)
  }

  async update(id: string, product: UpdateProductDto): Promise<Product | null> {
    const productToBeUpdated = product as Product
    return this.productRepository.update(id, productToBeUpdated)
  }

  async delete(id: string): Promise<void> {
    await this.productRepository.delete(id)
  }
}
