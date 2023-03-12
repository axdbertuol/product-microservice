import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  Query,
} from '@nestjs/common'
import { Product } from '../entities/product.entity'
import { ProductService } from '../services/product.service'
import { CreateProductDto } from '../dto/create-product.dto'
import { UpdateProductDto } from '../dto/update-product.dto'
import { ProductControllerInterface } from '../types/controller.d'

@Controller('products')
export class ProductController implements ProductControllerInterface {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  async find(@Param('id') id: string): Promise<Product | null> {
    return this.productService.find(id)
  }

  @Get()
  async findAllByCategory(
    @Query('categoryName') categoryName: string,
  ): Promise<Product[] | null> {
    return this.productService.findAllByCategory(categoryName)
  }

  @Get()
  async findAll(): Promise<Product[]> {
    return this.productService.findAll()
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
