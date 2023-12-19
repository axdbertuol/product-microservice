import { PaginatedResult } from '@/types/base'
import { ConflictException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { plainToInstance } from 'class-transformer'
import mongoose, { Model, ObjectId, SortOrder } from 'mongoose'
import { Observable, forkJoin, from, of, throwError } from 'rxjs'
import { catchError, map, mergeMap } from 'rxjs/operators'
import {
  CreateProductDto,
  CreatedProductDto,
} from '../../dto/create-product.dto'
import { FoundProductDto } from '../../dto/find-product.dto'
import { QueryProductDto } from '../../dto/query-product.dto'
import {
  UpdateProductDto,
  UpdatedProductDto,
} from '../../dto/update-product.dto'
import {
  ERRORS,
  FROM,
  KBaseException,
} from '../../filters/exceptions/base-exception'
import { ProductRepositoryInterface } from '../../types/repository'
import { Product, ProductDocument } from './product.entity'

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
            .filter((doc) => Boolean(doc.category))
            .map((doc) => doc.toJSON({ flattenObjectIds: true })),
        )
      }),
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

  findAll(): Observable<FoundProductDto[]> {
    return from(
      this.productModel.find().populate({ path: 'category' }).exec(),
    ).pipe(
      map((docs) => {
        return plainToInstance(
          FoundProductDto,
          docs
            .filter((doc) => Boolean(doc.category))
            .map((doc) => doc.toJSON({ flattenObjectIds: true })),
        )
      }),
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

  findManyWithPagination({
    filters,
    limit,
    page,
    sort,
    inclusive,
  }: QueryProductDto): Observable<PaginatedResult<FoundProductDto[]>> {
    const mongoQuery = []
    let price = null
    page = page || 1
    limit = limit || 10
    if (filters?.price) {
      const { min, max } = filters?.price
      if (min && max) {
        price = { $gte: min, $lte: max }
      } else if (min) {
        price = { $gte: min }
      } else if (max) {
        price = { $lte: max }
      }
      mongoQuery.push({ price })
    }

    if (filters?.name) {
      mongoQuery.push({
        name: { $regex: filters?.name, $options: 'i' },
      })
    }

    const logicalOp = inclusive ? '$or' : '$and'

    const defaultSort = { orderBy: 'name', order: 'asc' }
    const sortOptions = (sort || [defaultSort])
      .map(({ orderBy, order }) =>
        orderBy ? [orderBy, order ?? ('asc' as SortOrder)] : null,
      )
      .filter(Boolean) as [string, SortOrder][]

    const popOptions = {
      path: 'category',
      ...(filters?.category && {
        match: {
          name: { $regex: filters?.category, $options: 'i' },
        },
      }),
    }

    const finalQuery =
      mongoQuery.length > 0
        ? {
            [logicalOp]: mongoQuery,
          }
        : {}
    console.log('oi')
    const paginatedQueryObservable = from(
      this.productModel
        .find(finalQuery)
        .populate(popOptions)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .transform((products) => {
          return plainToInstance(
            FoundProductDto,
            products
              .filter((doc) => Boolean(doc.category))
              .map((product) => product.toJSON({ flattenObjectIds: true })),
          )
        })
        .exec(),
    )

    const countObs = from(
      this.productModel.find(finalQuery).countDocuments().exec(),
    )
    return forkJoin([paginatedQueryObservable, countObs]).pipe(
      mergeMap(([products, count]) => {
        console.log(products)
        const mappedResult = {
          data: products,
          page,
          limit,
          totalCount: count,
        } as PaginatedResult<FoundProductDto[]>

        return of(mappedResult)
      }),
      catchError((err) => {
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
