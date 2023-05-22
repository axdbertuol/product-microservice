import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common'
import { ProductService } from '../services/product.service'
import { CreateProductDto, CreatedProductDto } from '../dto/create-product.dto'
import { UpdateProductDto } from '../dto/update-product.dto'
import { ProductControllerInterface } from '../types/controller.d'
import { FindProductDto } from '../dto/find-product.dto'

@Controller('products')
export class ProductController implements ProductControllerInterface {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  find(@Param('id') id: string): Promise<FindProductDto | null | string> {
    return this.productService.find(id).unwrapOr('Something went wrong')
  }

  @Get()
  async findAll(
    @Query('categoryName') categoryName?: string,
  ): Promise<FindProductDto[] | null | string> {
    const res = this.productService
      .findAll(categoryName)
      .unwrapOr('Something went wrong')
    return res
  }

  @Post()
  async create(
    @Body(new ValidationPipe({ transform: true, enableDebugMessages: true }))
    product: CreateProductDto,
  ): Promise<CreatedProductDto | string | null> {
    const res = await this.productService.create(product)
    return res.isOk() ? res.unwrapOr('Something went wrong') : res.error.message
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() product: UpdateProductDto,
  ): Promise<UpdateProductDto | null | string> {
    return this.productService
      .update(id, product)
      .unwrapOr('Something went wrong')
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void | string> {
    return this.productService.delete(id).unwrapOr('Something went wrong')
  }
}
