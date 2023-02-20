import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Product, ProductDocument } from './entities/product.entity'
import { CreateProductDto } from './dto/create-product.dto'

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async find(id: string): Promise<Product | null> {
    return this.productModel.findById(id).exec()
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec()
  }

  async create(product: CreateProductDto): Promise<Product> {
    const newProduct = new this.productModel(product)
    return newProduct.save()
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
