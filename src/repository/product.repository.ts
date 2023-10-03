import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, ObjectId } from 'mongoose'
import { Product, ProductDocument } from '../entities/product.entity'
import { CreateProductDto, CreatedProductDto } from '../dto/create-product.dto'
import { ProductRepositoryInterface } from '../types/repository'
import { Observable, throwError, from } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { FindProductDto } from '../dto/find-product.dto'
import { UpdatedProductDto, UpdateProductDto } from '../dto/update-product.dto'
import { Category } from 'src/entities/category.entity'

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
        throwError(() => new Error('Database error: ' + err)),
      ),
    )
  }

  findAllByCategory(category: string): Observable<FindProductDto[]> {
    return from(
      this.productModel
        .find()
        .populate({
          path: 'category',
          match: { name: { $regex: category, $options: 'i' } },
        })
        .exec(),
      // .then((res) =>
      //   res
      //     .filter((prod) => prod.category)
      //     .map((prod) => this.mapProductToDto(prod)),
      // ),
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
        throwError(() => new Error('Database error: ' + err)),
      ),
    )
  }

  findAllByCategoryAndName(
    search: string,
    category: string,
  ): Observable<FindProductDto[]> {
    return from(
      this.productModel
        .find({
          name: { $regex: search, $options: 'i' },
        })
        .populate({
          path: 'category',
          match: { name: { $regex: category, $options: 'i' } },
        })
        .exec(),
    ).pipe(
      map((docs) =>
        docs
          .filter((doc) => Boolean(doc.category))
          .map((doc) => this.mapProductToDto(doc)),
      ),
      catchError((err) =>
        throwError(() => new Error('Database error: ' + err)),
      ),
    )
  }

  findAllByName(search: string): Observable<FindProductDto[]> {
    return from(
      this.productModel
        .find({
          name: { $regex: search, $options: 'i' },
        })
        .populate({
          path: 'category',
        })
        .exec(),
    ).pipe(
      map((docs) => docs.map((doc) => this.mapProductToDto(doc))),
      catchError((err) =>
        throwError(() => new Error('Database error: ' + err)),
      ),
    )
  }

  findAll(): Observable<FindProductDto[]> {
    return from(
      this.productModel.find().populate({ path: 'category' }).exec(),
    ).pipe(
      map((docs) => docs.map((doc) => this.mapProductToDto(doc))),
      catchError((err) =>
        throwError(() => new Error('Database error: ' + err)),
      ),
    )
  }

  create(product: CreateProductDto): Observable<CreatedProductDto | null> {
    return from(this.productModel.create(product)).pipe(
      map((doc) => (doc && (doc.toObject() as CreatedProductDto)) || null),
      catchError((err) =>
        throwError(() => new Error('Database error: ' + err)),
      ),
    )
  }

  update(
    id: string,
    product: UpdateProductDto,
    { newFavourite }: { newFavourite?: ObjectId },
  ): Observable<UpdatedProductDto | null> {
    const productToBeUpdated = product as Product

    return from(
      this.productModel
        .findByIdAndUpdate(
          id,
          {
            ...productToBeUpdated,
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
      map((doc) => (doc && (doc.toObject() as UpdatedProductDto)) || null),
      catchError((err) =>
        throwError(() => new Error('Database error: ' + err)),
      ),
    )
  }

  delete(id: string): Observable<{ _id: string; name: string } | null> {
    return from(this.productModel.findByIdAndDelete(id).exec()).pipe(
      map(
        (doc) =>
          (doc && (doc.toObject() as { _id: string; name: string })) || null,
      ),
      catchError((err) =>
        throwError(() => new Error('Database error: ' + err)),
      ),
    )
  }
  private mapProductToDto(
    product: ReturnType<(typeof this.productModel)['hydrate']>,
  ): FindProductDto {
    return {
      _id: product._id.toString(),
      name: product?.name,
      description: product?.description,
      category: product?.category as Category,
      price: product?.price,
      favouritedBy: product?.favouritedBy,
      // Add other mapped properties
    }
  }
}
