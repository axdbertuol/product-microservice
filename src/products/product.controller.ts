import { Controller, Get, Post, Body, Put, Delete, Param } from '@nestjs/common'
import { Product } from './entities/product.entity'
import { ProductService } from './product.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  async find(@Param('id') id: string): Promise<Product | null> {
    return this.productService.find(id)
  }

  @Get()
  async findAll(): Promise<Product[]> {
    return this.productService.findAll()
  }
  @Get()
  async findAllByCategory(
    @Param('categoryName') categoryName: string,
  ): Promise<Product[] | null> {
    return this.productService.findAllByCategory(categoryName)
  }

  @Post()
  async create(@Body() product: CreateProductDto): Promise<Product> {
    return this.productService.create(product)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() product: UpdateProductDto,
  ): Promise<Product | null> {
    return this.productService.update(id, product)
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.productService.delete(id)
  }
}
