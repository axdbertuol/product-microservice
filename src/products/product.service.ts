import { Injectable } from '@nestjs/common'
import { Product } from './entities/product.entity'
import { CreateProductDto } from './dto/create-product.dto'
import { ProductRepository } from './repository/product.repository'
import { UpdateProductDto } from './dto/update-product.dto'

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async find(id: string): Promise<Product | null> {
    return this.productRepository.find(id)
  }

  async findAllByCategory(category: string): Promise<Product[] | null> {
    return this.productRepository.findAllByCategory(category)
  }

  async findAll(): Promise<Product[]> {
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
