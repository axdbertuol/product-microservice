// product.module.ts

import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ProductSchema } from './entities/product.entity'
import { ProductService } from './services/product.service'
import { ProductController } from './controllers/product.controller'
import { CategorySchema } from './entities/category.entity'
import { ProductRepository } from './repository/product.repository'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Product', schema: ProductSchema },
      { name: 'Category', schema: CategorySchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
})
export class ProductsModule {}
