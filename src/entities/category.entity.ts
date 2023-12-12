import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, ObjectId, Document } from 'mongoose'

export type CategoryDocument = HydratedDocument<Category>

@Schema()
export class Category {
  @Prop({ required: true })
  name!: string
}

export const CategorySchema = SchemaFactory.createForClass(Category)
