// product.module.ts

import { Module } from '@nestjs/common'
import { ProductController } from './controllers/product.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Product, ProductSchema } from './entities/product.entity'
import { ProductService } from './services/product.service'
import { ProductRepository } from './repository/product.repository'
import { CategoryModule } from './category.module'
import { RabbitModule } from './rabbitmq.module'
import { ProductMessagingService } from './services/product-messaging.service'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Product.name,
        useFactory: () => {
          const schema = ProductSchema
          // schema.pre('findOneAndUpdate', function (next) {})
          return schema
        },
      },
    ]),
    CategoryModule,
    RabbitModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, ProductMessagingService],
})
export class ProductsModule {}
