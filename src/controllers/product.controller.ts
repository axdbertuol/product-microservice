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
import { UpdateProductDto, UpdatedProductDto } from '../dto/update-product.dto'
import { ProductControllerInterface } from '../types/controller.d'
import { FindProductDto } from '../dto/find-product.dto'
import { Observable } from 'rxjs'

@Controller('products')
export class ProductController implements ProductControllerInterface {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  find(@Param('id') id: string): Observable<FindProductDto | null | string> {
    return this.productService.find(id)
  }

  @Get()
  findAll(
    @Query('categoryName') categoryName?: string,
  ): Observable<FindProductDto[] | null | string> {
    return this.productService.findAll(categoryName)
  }

  @Post()
  create(
    @Body(new ValidationPipe({ transform: true, enableDebugMessages: true }))
    product: CreateProductDto,
  ): Observable<CreatedProductDto | string | null> {
    return this.productService.create(product)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() product: UpdateProductDto,
  ): Observable<UpdatedProductDto | null | string> {
    return this.productService.update(id, product)
  }

  @Delete(':id')
  delete(@Param('id') id: string): Observable<void | string> {
    return this.productService.delete(id)
  }
}
