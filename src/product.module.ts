// product.module.ts

import { Module } from '@nestjs/common'
import { ProductController } from './controllers/product.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Product, ProductSchema } from './entities/product.entity'
import { ProductService } from './services/product.service'
import { ProductRepository } from './repository/product.repository'
import { CategoryModule } from './category.module'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Product.name,
        useFactory: () => {
          const schema = ProductSchema
          // schema.pre('save', function () {
          //   console.log('Hello from pre save')
          // })
          return schema
        },
      },
    ]),
    CategoryModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
})
export class ProductsModule {}
