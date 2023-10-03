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
  UseFilters,
} from '@nestjs/common'
import { ProductService } from '../services/product.service'
import { CreateProductDto, CreatedProductDto } from '../dto/create-product.dto'
import { UpdateProductDto, UpdatedProductDto } from '../dto/update-product.dto'
import { ProductControllerInterface } from '../types/controller.d'
import { FindProductDto } from '../dto/find-product.dto'
import { Observable } from 'rxjs'
import { HttpExceptionFilter } from '../filters/http-exception.filter'
import { FavouriteProductDto } from '../dto/favourite-product.dto'

@Controller('products')
@UseFilters(HttpExceptionFilter)
export class ProductController implements ProductControllerInterface {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  find(@Param('id') id: string): Observable<FindProductDto | null> {
    return this.productService.find(id)
  }

  @Get()
  findAll(
    @Query('cat') categoryName?: string,
    @Query('search') search?: string,
  ): Observable<FindProductDto[] | null | string> {
    return this.productService.findAll(search, categoryName)
  }

  @Post()
  create(
    @Body(new ValidationPipe({ transform: true }))
    product: CreateProductDto,
  ): Observable<CreatedProductDto[] | null> {
    return this.productService.create(product)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() product: UpdateProductDto,
  ): Observable<UpdatedProductDto | null> {
    return this.productService.update(id, product)
  }

  @Delete(':id')
  delete(@Param('id') id: string): Observable<null | string> {
    return this.productService.delete(id)
  }

  @Post('favourite')
  favourite(
    @Body(new ValidationPipe({ transform: true }))
    favDto: FavouriteProductDto,
  ): Observable<UpdatedProductDto | null | string> {
    return this.productService.favourite(favDto.productId, favDto.userId)
  }
}
