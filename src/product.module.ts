// product.module.ts

import { Module } from '@nestjs/common'
import { ProductController } from './controllers/product.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Product, ProductSchema } from './entities/product.entity'
import { ProductService } from './services/product.service'
import { ProductRepository } from './repository/product.repository'
import { CategoryModule } from './category.module'
import { RabbitMQProvider } from './rabbitmq.provider'
import { RabbitMQModule } from './rabbitmq.module'

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
    RabbitMQModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, RabbitMQModule],
})
export class ProductsModule {}
