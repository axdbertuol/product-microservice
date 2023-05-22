// product.module.ts

import { Module } from '@nestjs/common'
import { CategoryController } from './controllers/category.controller'
import { CategoryService } from './services/category.service'
import { CategoryRepository } from './repository/category.repository'
import { MongooseModule } from '@nestjs/mongoose'
import { Category, CategorySchema } from './entities/category.entity'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Category.name,
        useFactory: () => {
          const schema = CategorySchema
          schema.pre('save', function () {
            console.log('Hello from pre save Category')
          })
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
