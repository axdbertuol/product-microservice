import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Product, ProductDocument } from '../entities/product.entity'
import { CreateProductDto, CreatedProductDto } from '../dto/create-product.dto'
import { ProductRepositoryInterface } from '../types/repository'
import { ResultAsync } from 'neverthrow'
import { FindProductDto } from '../dto/find-product.dto'

@Injectable()
export class ProductRepository implements ProductRepositoryInterface {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  find(id: string): ResultAsync<Product | null, Error> {
    return ResultAsync.fromPromise(
      this.productModel.findById(id).exec(),
      (err) => new Error('Database error ' + err),
    ).map((doc) => (doc && doc.toObject()) || null)
  }

  findAllByCategory(category: string): ResultAsync<FindProductDto[], Error> {
    return ResultAsync.fromPromise(
      this.productModel
        .find()
        .populate({
          path: 'category',
          match: { name: category },
        })
        .exec()
        .then((res) => res.filter((prod) => prod.category)),
      (err) => new Error('Database error ' + err),
    ).map((docs) => docs.map((doc) => doc.toObject()) as FindProductDto[])
  }

  findAll(): ResultAsync<FindProductDto[], Error> {
    return ResultAsync.fromPromise(
      this.productModel.find().populate({ path: 'category' }).exec(),
      (err) => new Error('Database error ' + err),
    ).map((docs) => docs.map((doc) => doc.toObject()) as FindProductDto[])
  }

  create(product: CreateProductDto): ResultAsync<CreatedProductDto, Error> {
    return ResultAsync.fromPromise(
      this.productModel.create(product),
      (err) => new Error('Database error: ' + err),
    ).map((doc) => doc.toObject())
  }

  update(id: string, product: Product): ResultAsync<Product | null, Error> {
    return ResultAsync.fromPromise(
      this.productModel.findByIdAndUpdate(id, product, { new: true })?.exec(),
      (err) => new Error('Database error ' + err),
    )
  }

  delete(id: string): ResultAsync<Product | null, Error> {
    return ResultAsync.fromPromise(
      this.productModel.findByIdAndDelete(id).exec(),
      (err) => new Error('Database error ' + err),
    )
  }
}
