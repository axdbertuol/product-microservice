import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Product, ProductDocument } from '../entities/product.entity'
import { CreateProductDto } from '../dto/create-product.dto'
import { ProductRepositoryInterface } from '../types/repository'

@Injectable()
export class ProductRepository implements ProductRepositoryInterface {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async find(id: string): Promise<Product | null> {
    return this.productModel.findById(id).exec()
  }

  async findAllByCategory(category: string): Promise<Product[]> {
    return this.productModel
      .find()
      .populate({
        path: 'category',
        match: { name: category },
      })
      .exec()
      .then((res) => res.filter((prod) => prod.category))
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec()
  }

  async create(product: CreateProductDto): Promise<Product> {
    const newProduct = (await this.productModel.create(product)).save()
    return newProduct
  }

  async update(id: string, product: Product): Promise<Product | null> {
    return this.productModel
      .findByIdAndUpdate(id, product, { new: true })
      ?.exec()
  }

  async delete(id: string): Promise<void> {
    await this.productModel.findByIdAndDelete(id).exec()
  }
}
