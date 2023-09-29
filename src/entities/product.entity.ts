import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument, ObjectId } from 'mongoose'
import { Category } from './category.entity'

export type ProductDocument = HydratedDocument<Product>

@Schema()
export class Product {
  @Prop({ required: true, text: true })
  name: string

  @Prop({ required: false, default: '', text: true })
  description: string

  @Prop({ required: true })
  price: number

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  })
  category: Category

  _id: ObjectId
}

export const ProductSchema = SchemaFactory.createForClass(Product)

// ProductSchema.pre<ProductDocument>('validate', function (this: Product, next) {
//   if (typeof this.category === 'string') {
//   }
// })
