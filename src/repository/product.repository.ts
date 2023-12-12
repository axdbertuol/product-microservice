import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model, ObjectId } from 'mongoose'
import { Product, ProductDocument } from '../entities/product.entity'
import { CreateProductDto, CreatedProductDto } from '../dto/create-product.dto'
import { ProductRepositoryInterface } from '../types/repository'
import { Observable, throwError, from, timer } from 'rxjs'
import { catchError, map, mergeMap } from 'rxjs/operators'
import { FindProductDto } from '../dto/find-product.dto'
import { UpdatedProductDto, UpdateProductDto } from '../dto/update-product.dto'

@Injectable()
export class ProductRepository implements ProductRepositoryInterface {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  find(id: string): Observable<FindProductDto | null> {
    return from(
      this.productModel
        .findById(id)
        .populate({
          path: 'category',
        })
        .exec(),
    ).pipe(
      map((doc) => (doc && this.mapProductToDto(doc)) || null),
      catchError((err) =>
        throwError(() => {
          if (err instanceof mongoose.Error.CastError) {
            throw new BadRequestException({
              cause: { error: 'Error casting variable ' + err.path },
            })
          }
          throw new Error('Database error: ' + err)
        }),
      ),
    )
  }

  findAllByCategory(category: string): Observable<FindProductDto[]> {
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
      map((docs) =>
        docs
          .filter((doc) => Boolean(doc.category))
          .map((doc) => {
            const result = this.mapProductToDto(doc)
            return result
          }),
      ),
      catchError((err) =>
        throwError(() => {
          if (err instanceof mongoose.Error.CastError) {
            throw new BadRequestException({
              cause: { error: 'Error casting variable ' + err.path },
            })
          }
          throw new Error('Database error: ' + err)
        }),
      ),
    )
  }

  findAllByCategoryAndName(
    search: string,
    category?: string,
  ): Observable<FindProductDto[]> {
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
        docs
          .filter((doc) => Boolean(doc.category))
          .map((doc) => this.mapProductToDto(doc)),
      ),
      catchError((err) =>
        throwError(() => {
          if (err instanceof mongoose.Error.CastError) {
            throw new BadRequestException({
              cause: { error: 'Error casting variable ' + err.path },
            })
          }
          throw new Error('Database error: ' + err)
        }),
      ),
    )
  }

  findAllByName(search: string): Observable<FindProductDto[]> {
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
      map((docs) => docs.map((doc) => this.mapProductToDto(doc))),
      catchError((err) =>
        throwError(() => {
          if (err instanceof mongoose.Error.CastError) {
            throw new BadRequestException({
              cause: { error: 'Error casting variable ' + err.path },
            })
          }
          throw new Error('Database error: ' + err)
        }),
      ),
    )
  }

  findAll(): Observable<FindProductDto[]> {
    return from(
      this.productModel.find().populate({ path: 'category' }).exec(),
    ).pipe(
      map((docs) => docs.map((doc) => this.mapProductToDto(doc))),
      catchError((err) =>
        throwError(() => {
          if (err instanceof mongoose.Error.CastError) {
            throw new BadRequestException({
              cause: { error: 'Error casting variable ' + err.path },
            })
          }
          throw new Error('Database error: ' + err)
        }),
      ),
    )
  }

  create(product: CreateProductDto): Observable<CreatedProductDto[] | null> {
    console.log(product)
    return from(this.productModel.create([product])).pipe(
      mergeMap((_docs) => {
        const observable = new Observable<any>((subscriber) => {
          _docs.forEach(async (doc) => {
            const result = await doc.populate('category')
            subscriber.next(result.toJSON({ flattenObjectIds: true }))
          })
        })
        const arr = [] as any[]
        const subscript = observable.subscribe({
          next: (value) => {
            console.log(value)
            arr.push(this.mapProductToDto(value) as CreatedProductDto)
          },
        })

        return timer(50).pipe(
          map(() => {
            subscript.unsubscribe()
            return arr
          }),
        )
      }),
      catchError((err) => {
        if (err.code === 11000)
          throw new ConflictException({ cause: 'Product already exists' })
        if (err instanceof mongoose.Error.CastError) {
          throw new BadRequestException({
            cause: { error: 'Error casting variable ' + err.path },
          })
        }
        throw new Error('Database error: ' + err)
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
          (doc &&
            (this.mapProductToDto(
              doc.toJSON({ flattenObjectIds: true }),
            ) as UpdatedProductDto)) ||
          null,
      ),
      catchError((err) => {
        if (err?.code === 11000)
          throw new ConflictException({
            cause: { error: 'Item already exists' },
          })
        if (err instanceof mongoose.Error.CastError) {
          throw new BadRequestException({
            cause: { error: 'Error casting variable ' + err.path },
          })
        }
        throw new Error('Database error: ' + err)
      }),
    )
  }

  delete(id: string): Observable<{ _id: string; name: string } | null> {
    return from(this.productModel.findByIdAndDelete(id).exec()).pipe(
      map(
        (doc) =>
          (doc && (doc.toObject() as { _id: string; name: string })) || null,
      ),
      catchError((err) =>
        throwError(() => {
          if (err instanceof mongoose.Error.CastError) {
            throw new BadRequestException({
              cause: { error: 'Error casting variable ' + err.path },
            })
          }
          throw new Error('Database error: ' + err)
        }),
      ),
    )
  }
  private mapProductToDto<T extends FindProductDto | CreatedProductDto>(
    product: Partial<Product>,
  ): FindProductDto {
    return {
      id: product?._id?.toString(),
      name: product?.name,
      description: product?.description,
      category: product?.category?.name,
      price: product?.price,
      favouritedBy: product?.favouritedBy,
      // Add other mapped properties
    } as T
  }
}
