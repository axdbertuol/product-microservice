import { PaginatedResult } from '@/types/base'
import { HttpStatus, Injectable } from '@nestjs/common'
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
      catchError((err: mongoose.Error) => {
        return throwError(() => this.handleErrors(err))
      }),
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
      catchError((err: mongoose.Error) => {
        return throwError(() => this.handleErrors(err))
      }),
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
            .map((doc) => doc.toJSON({ flattenObjectIds: true }))
            .filter((doc) => Boolean(doc.category)),
        ),
      ),
      catchError((err: mongoose.Error) => {
        return throwError(() => this.handleErrors(err))
      }),
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
            .map((doc) => doc.toJSON({ flattenObjectIds: true }))
            .filter((doc) => Boolean(doc.category)),
        ),
      ),
      catchError((err: mongoose.Error) => {
        return throwError(() => this.handleErrors(err))
      }),
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
      catchError((err: mongoose.Error) => {
        return throwError(() => this.handleErrors(err))
      }),
    )
  }

  findManyWithPagination({
    filters,
    limit,
    page,
    sort,
    inclusive,
  }: QueryProductDto): Observable<PaginatedResult<FoundProductDto[]>> {
    page = page || 1
    limit = limit || 10
    const priceFilter = this.buildPriceFilter(filters?.price)
    const nameFilter = this.buildNameFilter(filters?.name)
    const popOptions = this.buildPopulateOptions(filters?.category)

    const logicalOp = inclusive ? '$or' : '$and'

    const defaultSort = { orderBy: 'name', order: 'asc' }
    const sortOptions = (sort || [defaultSort])
      .map(({ orderBy, order }) =>
        orderBy ? [orderBy, order ?? ('asc' as SortOrder)] : null,
      )
      .filter(Boolean) as [string, SortOrder][]

    const finalQuery = this.buildFiltersQuery(
      priceFilter,
      nameFilter,
      logicalOp,
    )
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
      this.productModel
        .find({ ...finalQuery }, { lean: true })
        .populate(popOptions)
        .countDocuments()
        .exec(),
    )
    return forkJoin([paginatedQueryObservable, countObs]).pipe(
      mergeMap(([products, count]) => {
        console.log(count)
        const mappedResult = {
          data: products,
          page,
          limit,
          totalCount: count,
        } as PaginatedResult<FoundProductDto[]>

        return of(mappedResult)
      }),
      catchError((err: mongoose.Error) => {
        return throwError(() => this.handleErrors(err))
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
      catchError((err: mongoose.Error) => {
        return throwError(() => this.handleErrors(err))
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
      map((doc) => {
        return doc
          ? plainToInstance(
              UpdatedProductDto,
              doc.toJSON({ flattenObjectIds: true }),
            )
          : null
      }),
      catchError((err: mongoose.Error) => {
        return throwError(() => this.handleErrors(err))
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
      catchError((err: mongoose.Error) => {
        return throwError(() => this.handleErrors(err))
      }),
    )
  }
  private buildPriceFilter(priceFilter?: { min?: number; max?: number }) {
    if (!priceFilter) return {}
    const { min, max } = priceFilter
    return {
      price: {
        ...(min && { $gte: min }),
        ...(max && { $lte: max }),
      },
    }
  }

  private buildNameFilter(nameFilter?: string) {
    return nameFilter ? { name: { $regex: nameFilter, $options: 'i' } } : {}
  }

  private buildPopulateOptions(categoryFilter?: string) {
    return {
      path: 'category',
      ...(categoryFilter && {
        match: { name: { $regex: categoryFilter, $options: 'i' } },
      }),
      options: { lean: true },
    }
  }

  private buildFiltersQuery(
    priceFilter: object,
    nameFilter: object,
    logicalOp: string,
  ) {
    return Object.keys(priceFilter).length || Object.keys(nameFilter).length
      ? { [logicalOp]: [priceFilter, nameFilter] }
      : {}
  }

  private handleErrors(err: any) {
    if (err?.code === 11000) {
      throw new KBaseException(
        FROM.repo,
        ERRORS.conflict,
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          message: err.message,
          path: err.path,
        },
      )
    }
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
  }
}
