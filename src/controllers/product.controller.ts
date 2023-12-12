import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common'
import { ProductService } from '../services/product.service'
import { CreateProductDto, CreatedProductDto } from '../dto/create-product.dto'
import { UpdateProductDto, UpdatedProductDto } from '../dto/update-product.dto'
import { ProductControllerInterface } from '../types/controller.d'
import { FindProductDto } from '../dto/find-product.dto'
import { Observable } from 'rxjs'
import { FavouriteProductDto } from '../dto/favourite-product.dto'
import { ApiQuery, ApiTags } from '@nestjs/swagger'

@ApiTags('Product')
@Controller({
  path: 'product',
  version: '1',
})
export class ProductController implements ProductControllerInterface {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  find(@Param('id') id: string): Observable<FindProductDto | null> {
    return this.productService.find(id)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'cat', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('cat') categoryName?: string,
    @Query('search') search?: string,
  ): Observable<FindProductDto[] | null | string> {
    return this.productService.findAll(search, categoryName)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body()
    product: CreateProductDto,
  ): Observable<CreatedProductDto[] | null> {
    return this.productService.create(product)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) product: UpdateProductDto,
  ): Observable<UpdatedProductDto | null> {
    console.log(product)
    return this.productService.update(id, product)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string): Observable<null | string> {
    return this.productService.delete(id)
  }

  @Post('favourite')
  @HttpCode(HttpStatus.OK)
  favourite(
    @Body()
    favDto: FavouriteProductDto,
  ): Observable<UpdatedProductDto | null | string> {
    return this.productService.favourite(favDto.productId, favDto.userId)
  }
}
