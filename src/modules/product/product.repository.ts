import { ConflictException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model, ObjectId } from 'mongoose'
import { Observable, from, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import {
  CreateProductDto,
  CreatedProductDto,
} from '../../dto/create-product.dto'
import { FoundProductDto } from '../../dto/find-product.dto'
import {
  UpdateProductDto,
  UpdatedProductDto,
} from '../../dto/update-product.dto'
import { Product, ProductDocument } from './product.entity'
import {
  ERRORS,
  FROM,
  KBaseException,
} from '../../filters/exceptions/base-exception'
import { ProductRepositoryInterface } from '../../types/repository'
import { plainToInstance } from 'class-transformer'

@Injectable()
export class ProductRepository implements ProductRepositoryInterface {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  find(id: string): Observable<FoundProductDto | null> {
    return from(
      this.productModel
        .findById(id)
        .populate({
          path: 'category',
        })
        .exec(),
    ).pipe(
      map(
        (doc) =>
          doc &&
          plainToInstance(
            FoundProductDto,
            doc.toJSON({ flattenObjectIds: true }),
          ),
      ),
      catchError((err) =>
        throwError(() => {
          if (err instanceof mongoose.Error.CastError) {
            throw new KBaseException(
              FROM.repo,
              ERRORS.unexpected,
              HttpStatus.UNPROCESSABLE_ENTITY,
              {
                message: err.message,
                path: err.path,
              },
            )
          }
          throw new KBaseException(
            FROM.repo,
            ERRORS.unexpected,
            HttpStatus.INTERNAL_SERVER_ERROR,
            {
              message: err.message,
              path: err.path,
            },
          )
        }),
      ),
    )
  }

  findAllByCategory(category: string): Observable<FoundProductDto[]> {
    return from(
      this.productModel
        .find()
        .populate({
          path: 'category',
          match: {
            name: { $regex: category, $options: 'i' },
          },
        })
        .exec(),
    ).pipe(
      map((docs) => {
        return plainToInstance(
          FoundProductDto,
          docs
            .map((doc) => doc.toJSON({ flattenObjectIds: true }))
            .filter((doc) => Boolean(doc.category)),
        )
      }),
      catchError((err) =>
        throwError(() => {
          if (err instanceof mongoose.Error.CastError) {
            throw new KBaseException(
              FROM.repo,
              ERRORS.unexpected,
              HttpStatus.UNPROCESSABLE_ENTITY,
              {
                message: err.message,
                path: err.path,
              },
            )
          }
          throw new KBaseException(
            FROM.repo,
            ERRORS.unexpected,
            HttpStatus.INTERNAL_SERVER_ERROR,
            {
              message: err.message,
              path: err.path,
            },
          )
        }),
      ),
    )
  }
  findAllByCategoryAndName(
    search: string,
    category?: string,
  ): Observable<FoundProductDto[]> {
    return from(
      this.productModel
        .find({
          $or: [
            {
              name: { $regex: search, $options: 'i' },
            },
            {
              $text: { $search: search, $caseSensitive: false },
            },
          ],
        })
        .populate({
          path: 'category',
          // match: { name: { $regex: category ?? search, $options: 'i' } },
          match: {
            name: { $regex: category ?? search, $options: 'i' },
          },
        })
        .exec(),
    ).pipe(
      map((docs) =>
        plainToInstance(
          FoundProductDto,
          docs
            .filter((doc) => Boolean(doc.category))
            .map((doc) => doc.toJSON({ flattenObjectIds: true })),
        ),
      ),
      catchError((err) =>
        throwError(() => {
          if (err instanceof mongoose.Error.CastError) {
            throw new KBaseException(
              FROM.repo,
              ERRORS.unexpected,
              HttpStatus.UNPROCESSABLE_ENTITY,
              {
                message: err.message,
                path: err.path,
              },
            )
          }
          throw new KBaseException(
            FROM.repo,
            ERRORS.unexpected,
            HttpStatus.INTERNAL_SERVER_ERROR,
            {
              message: err.message,
              path: err.path,
            },
          )
        }),
      ),
    )
  }

  findAllByName(search: string): Observable<FoundProductDto[]> {
    return from(
      this.productModel
        .find({
          $or: [
            {
              name: { $regex: search, $options: 'i' },
            },
            { $text: { $search: search, $caseSensitive: false } },
          ],
        })
        .populate({
          path: 'category',
        })
        .exec(),
    ).pipe(
      map((docs) =>
        plainToInstance(
          FoundProductDto,
          docs
            .filter((doc) => Boolean(doc.category))
            .map((doc) => doc.toJSON({ flattenObjectIds: true })),
        ),
      ),
      catchError((err) =>
        throwError(() => {
          if (err instanceof mongoose.Error.CastError) {
            throw new KBaseException(
              FROM.repo,
              ERRORS.unexpected,
              HttpStatus.UNPROCESSABLE_ENTITY,
              {
                message: err.message,
                path: err.path,
              },
            )
          }
          throw new KBaseException(
            FROM.repo,
            ERRORS.unexpected,
            HttpStatus.INTERNAL_SERVER_ERROR,
            {
              message: err.message,
              path: err.path,
            },
          )
        }),
      ),
    )
  }

  findAll(): Observable<FoundProductDto[]> {
    return from(
      this.productModel.find().populate({ path: 'category' }).exec(),
    ).pipe(
      map((docs) => {
        return plainToInstance(
          FoundProductDto,
          docs
            .map((doc) => doc.toJSON({ flattenObjectIds: true }))
            .filter((doc) => Boolean(doc.category)),
        )
      }),
      catchError((err) =>
        throwError(() => {
          if (err instanceof mongoose.Error.CastError) {
            throw new KBaseException(
              FROM.repo,
              ERRORS.unexpected,
              HttpStatus.UNPROCESSABLE_ENTITY,
              {
                message: err.message,
                path: err.path,
              },
            )
          }
          throw new KBaseException(
            FROM.repo,
            ERRORS.unexpected,
            HttpStatus.INTERNAL_SERVER_ERROR,
            {
              message: err.message,
              path: err.path,
            },
          )
        }),
      ),
    )
  }

  create(product: CreateProductDto): Observable<CreatedProductDto[] | null> {
    return from(this.productModel.create([product])).pipe(
      map((_docs) => {
        return plainToInstance(
          CreatedProductDto,
          _docs.map((doc) => doc.toJSON({ flattenObjectIds: true })),
        )
      }),
      catchError((err) => {
        if (err?.code === 11000)
          throw new KBaseException(
            FROM.repo,
            ERRORS.conflict,
            HttpStatus.CONFLICT,
            {
              message: err.message,
              path: err.path,
            },
          )
        if (err instanceof mongoose.Error.CastError) {
          throw new KBaseException(
            FROM.repo,
            ERRORS.cast,
            HttpStatus.UNPROCESSABLE_ENTITY,
            {
              message: err.message,
              path: err.path,
            },
          )
        }
        throw new KBaseException(
          FROM.repo,
          ERRORS.unexpected,
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            message: err.message,
            path: err.path,
          },
        )
      }),
    )
  }

  update(
    id: string,
    product: UpdateProductDto,
    { newFavourite }: { newFavourite?: ObjectId } = {},
  ): Observable<UpdatedProductDto | null> {
    return from(
      this.productModel
        .findByIdAndUpdate(
          id,
          {
            ...product,
            ...(product.category
              ? {
                  $set: {
                    category: product.category,
                  },
                }
              : null),
            ...(newFavourite
              ? { $addToSet: { favouritedBy: newFavourite } }
              : null),
          },
          {
            new: true,
          },
        )
        .populate({
          path: 'category',
        })
        .exec(),
    ).pipe(
      map(
        (doc) =>
          doc &&
          plainToInstance(
            UpdatedProductDto,
            doc.toJSON({ flattenObjectIds: true }),
          ),
      ),
      catchError((err) => {
        if (err?.code === 11000)
          throw new ConflictException({
            cause: { error: 'conflictOnUpdate:' + err.path },
            message: err.message,
          })
        if (err instanceof mongoose.Error.CastError) {
          throw new KBaseException(
            FROM.repo,
            ERRORS.cast,
            HttpStatus.UNPROCESSABLE_ENTITY,
            {
              message: err.message,
              path: err.path,
            },
          )
        }
        throw new KBaseException(
          FROM.repo,
          ERRORS.unexpected,
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            message: err.message,
            path: err.path,
          },
        )
      }),
    )
  }

  delete(
    id: string,
  ): Observable<Pick<UpdatedProductDto, '_id' | 'name'> | null> {
    return from(
      this.productModel
        .findByIdAndDelete(id, { includeResultMetadata: true })
        .exec(),
    ).pipe(
      map(
        (doc) =>
          (doc.ok &&
            plainToInstance(
              UpdatedProductDto,
              doc.value?.toJSON({ flattenObjectIds: true }),
            )) ||
          null,
      ),
      catchError((err) =>
        throwError(() => {
          if (err instanceof mongoose.Error.CastError) {
            throw new KBaseException(
              FROM.repo,
              ERRORS.cast,
              HttpStatus.UNPROCESSABLE_ENTITY,
              {
                message: err.message,
                path: err.path,
              },
            )
          }
          throw new KBaseException(
            FROM.repo,
            ERRORS.unexpected,
            HttpStatus.INTERNAL_SERVER_ERROR,
            {
              message: err.message,
              path: err.path,
            },
          )
        }),
      ),
    )
  }
}
