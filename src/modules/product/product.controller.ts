import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
  ValidationPipe,
} from '@nestjs/common'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import { Observable } from 'rxjs'
import {
  CreateProductDto,
  CreatedProductDto,
} from '../../dto/create-product.dto'
import { FavouriteProductDto } from '../../dto/favourite-product.dto'
import { FindProductDto } from '../../dto/find-product.dto'
import {
  UpdateProductDto,
  UpdatedProductDto,
} from '../../dto/update-product.dto'
import { ProductService } from './product.service'
import { ProductControllerInterface } from '../../types/controller'

@ApiTags('Product')
@Controller({
  path: 'product',
  version: '1',
})
export class ProductController implements ProductControllerInterface {
  constructor(private readonly productService: ProductService) {}

  @Get(':filter')
  @HttpCode(HttpStatus.OK)
  find(@Param('filter') filter: string): Observable<FindProductDto | null> {
    return this.productService.find(filter)
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

  @SerializeOptions({
    excludePrefixes: ['_'],

    // excludeExtraneousValues: true,
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) product: UpdateProductDto,
  ): Observable<UpdatedProductDto | null> {
    return this.productService.update(id, product)
  }

  @SerializeOptions({
    excludePrefixes: ['_'],
    // excludeExtraneousValues: true,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string): Observable<null | string> {
    return this.productService.delete(id)
  }

  @SerializeOptions({
    excludePrefixes: ['_'],
    // excludeExtraneousValues: true,
  })
  @Post('favourite')
  @HttpCode(HttpStatus.OK)
  favourite(
    @Body()
    favDto: FavouriteProductDto,
  ): Observable<UpdatedProductDto | null | string> {
    return this.productService.favourite(favDto.productId, favDto.userId)
  }
}
