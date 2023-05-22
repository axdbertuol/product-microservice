import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, ObjectId, Document } from 'mongoose'

export type CategoryDocument = HydratedDocument<Category>

@Schema()
export class Category extends Document {
  @Prop({ required: true })
  name: string

  _id: ObjectId
}

export const CategorySchema = SchemaFactory.createForClass(Category)
