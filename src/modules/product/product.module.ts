// product.module.ts

import { HttpStatus, Module } from '@nestjs/common'
import { ProductController } from './product.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Product, ProductSchema } from './product.entity'
import { ProductService } from './product.service'
import { ProductRepository } from './product.repository'
import { CategoryModule } from '../category/category.module'
import { CategoryService } from '../category/category.service'
import { lastValueFrom } from 'rxjs'
import {
  ERRORS,
  FROM,
  KBaseException,
} from '../../filters/exceptions/base-exception'
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
