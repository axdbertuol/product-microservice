import { Controller, Get, Post, Body, Put, Delete, Param } from '@nestjs/common'
import { Product } from './entities/product.entity'
import { ProductService } from './product.service'

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(): Promise<Product[]> {
    return this.productService.findAll()
  }

  @Post()
  async create(@Body() product: Product): Promise<Product> {
    return this.productService.create(product)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() product: Product,
  ): Promise<Product | null> {
    return this.productService.update(id, product)
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.productService.delete(id)
  }
}
