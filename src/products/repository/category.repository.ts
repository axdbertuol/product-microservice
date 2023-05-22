import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, ObjectId } from 'mongoose'
import { CRUD } from '../types/base.d'
import { Category, CategoryDocument } from '../entities/category.entity'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { ResultAsync, errAsync, okAsync } from 'neverthrow'
import { FindCategoryDto } from '../dto/find-category.dto'

@Injectable()
export class CategoryRepository implements CRUD {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  find(id: string): ResultAsync<Category | null, Error> {
    return ResultAsync.fromPromise(
      this.categoryModel.findById(id).exec(),
      () => new Error('Database error'),
    )
  }
  findByName(categoryName: string): ResultAsync<FindCategoryDto[], Error> {
    return ResultAsync.fromPromise(
      this.categoryModel.find({ name: categoryName }).exec(),
      () => new Error('Database error'),
    ).map((doc) => doc.map((doc) => doc && doc.toObject()))
  }

  findAll(): ResultAsync<Category[], Error> {
    return ResultAsync.fromPromise(
      this.categoryModel.find().exec(),
      () => new Error('Database error'),
    ).map((docs) => docs.map((doc) => doc.toObject()))
  }

  create(category: CreateCategoryDto): ResultAsync<Category, Error> {
    return ResultAsync.fromPromise(
      this.categoryModel.create(category),
      () => new Error('Database error'),
    ).map((doc) => doc.toObject())
  }

  update(id: string, category: Category): ResultAsync<Category | null, Error> {
    return ResultAsync.fromPromise(
      this.categoryModel.findByIdAndUpdate(id, category, { new: true })?.exec(),
      () => new Error('Database error'),
    )
  }

  delete(id: string): ResultAsync<Category | null, Error> {
    return ResultAsync.fromPromise(
      this.categoryModel.findByIdAndDelete(id).exec(),
      () => new Error('Database error'),
    )
  }
  exists(category?: string): ResultAsync<{ _id: ObjectId } | null, Error> {
    return this.categoryModel.exists(
      { name: category },
      (err, doc): ResultAsync<{ _id: ObjectId } | null, Error> => {
        if (err) {
          return errAsync(err)
        }
        return okAsync(doc as unknown as { _id: ObjectId })
      },
    ) as unknown as ResultAsync<{ _id: ObjectId } | null, Error>
  }
}
