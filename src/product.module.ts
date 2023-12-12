// product.module.ts

import { HttpStatus, Module } from '@nestjs/common'
import { ProductController } from './controllers/product.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Product, ProductSchema } from './entities/product.entity'
import { ProductService } from './services/product.service'
import { ProductRepository } from './repository/product.repository'
import { CategoryModule } from './category.module'
import { CategoryService } from './services/category.service'
import { lastValueFrom } from 'rxjs'
import {
  ERRORS,
  FROM,
  KBaseException,
} from './filters/exceptions/base-exception'
import { isObjectIdOrHexString } from 'mongoose'

@Module({
  imports: [
    CategoryModule,

    MongooseModule.forFeatureAsync([
      {
        name: Product.name,
        inject: [CategoryService],
        imports: [CategoryModule],

        useFactory: (categoryService: CategoryService) => {
          const schema = ProductSchema
          schema.pre('save', async function (next) {
            const category = this.category.toString()
            if (this.isModified()) {
              if (!category) {
                return next()
              }

              try {
                let foundCategory
                if (isObjectIdOrHexString(category)) {
                  foundCategory = await lastValueFrom(
                    categoryService.find(category),
                  )
                } else {
                  foundCategory = await lastValueFrom(
                    categoryService.findByName(category),
                  )
                }

                this.set('category', foundCategory)
                if (!foundCategory) {
                  return next(
                    new KBaseException(
                      FROM.service,
                      ERRORS.invalidOrUndefinedData,
                      HttpStatus.PRECONDITION_FAILED,
                    ),
                  )
                }

                next()
              } catch (error) {
                next(
                  new KBaseException(
                    FROM.service,
                    ERRORS.unexpected,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    { path: 'product.presave.hook' },
                  ),
                )
              }
            } else {
              // No modifications, it might be another type of query (e.g., read)
              next()
            }
            if (!category) {
              return next()
            }
          })
          return schema
        },
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, CategoryService],
})
export class ProductsModule {}
