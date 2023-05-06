import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, ObjectId } from 'mongoose'

export type CategoryDocument = HydratedDocument<Category>

@Schema()
export class Category {
  @Prop({ required: true })
  name: string

  _id: ObjectId
}

export const CategorySchema = SchemaFactory.createForClass(Category)
