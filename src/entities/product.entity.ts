import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument, ObjectId } from 'mongoose'
import { Category } from './category.entity'

export type ProductDocument = HydratedDocument<Product>

@Schema()
export class Product {
  @Prop({ required: true, index: true })
  name: string

  @Prop({ required: false, default: '', index: true })
  description: string

  @Prop({ required: true })
  price: number

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  })
  category: Category
  @Prop({
    validate: {
      validator: (newValues: ObjectId[]) => {
        // Compare the Set and Array's sizes, to see if there were any
        // duplicates. If they're not equal, there was a duplicate, and
        // validation will fail.
        return new Set(newValues).size === newValues.length
      },
    },
    // default: [],
    required: false,
  })
  favouritedBy?: ObjectId[]
  _id: ObjectId
}

export const ProductSchema = SchemaFactory.createForClass(Product)

// ProductSchema.pre<ProductDocument>('validate', function (this: Product, next) {
//   if (typeof this.category === 'string') {
//   }
// })
