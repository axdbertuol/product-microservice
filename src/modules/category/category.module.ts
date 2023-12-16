// product.module.ts

import { Module } from '@nestjs/common'
import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'
import { CategoryRepository } from './category.repository'
import { MongooseModule } from '@nestjs/mongoose'
import { Category, CategorySchema } from './category.entity'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Category.name,
        useFactory: () => {
          const schema = CategorySchema
          // schema.pre('save', function () {
          //   console.log('Hello from pre save Category')
          // })
          return schema
        },
      },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
