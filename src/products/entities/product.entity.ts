import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { Category } from './category.entity'

export type ProductDocument = Product & Document

@Schema()
export class Product {
  @Prop({ required: true })
  name: string

  @Prop()
  description: string | undefined

  @Prop({ required: true })
  price: number

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  })
  category: Category
}

export const ProductSchema = SchemaFactory.createForClass(Product)
