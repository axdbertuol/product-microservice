import { ConflictException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CRUD } from '../types/base.d'
import { Category, CategoryDocument } from '../entities/category.entity'
import {
  CreateCategoryDto,
  CreatedCategoryDto,
} from '../dto/create-category.dto'
import { Observable, from } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { FindCategoryDto } from '../dto/find-category.dto'
import { UpdatedCategoryDto } from 'src/dto/update-category.dto'

@Injectable()
export class CategoryRepository implements CRUD {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  find(id: string): Observable<FindCategoryDto | null> {
    return from(this.categoryModel.findById(id).exec()).pipe(
      map((doc) => (doc && (doc.toObject() as FindCategoryDto)) || null),
      catchError((err) => {
        throw new Error('Database Error: ' + err.message)
      }),
    )
  }

  findByName(categoryName: string): Observable<FindCategoryDto[]> {
    return from(
      this.categoryModel
        .find({ name: { $regex: categoryName, $options: 'i' } })
        .exec(),
    ).pipe(
      map((docs) =>
        docs.map((doc) => (doc && (doc.toObject() as FindCategoryDto)) || null),
      ),
      catchError((err) => {
        throw new Error('Database Error: ' + err.message)
      }),
    )
  }

  findAll(): Observable<FindCategoryDto[]> {
    return from(this.categoryModel.find().exec()).pipe(
      map((docs) => docs.map((doc) => doc.toObject() as FindCategoryDto)),
      catchError((err) => {
        throw new Error('Database Error: ' + err.message)
      }),
    )
  }

  create(category: CreateCategoryDto): Observable<CreatedCategoryDto[]> {
    return from(this.categoryModel.create([category])).pipe(
      map(
        (doc) =>
          (doc && doc.map((d) => d.toObject() as CreatedCategoryDto)) || null,
      ),
      catchError((err) => {
        if (err?.code === 11000)
          throw new ConflictException('Category already exists')
        throw new Error('Database Error: ' + err.message)
      }),
    )
  }

  update(
    id: string,
    category: Category,
  ): Observable<UpdatedCategoryDto | null> {
    return from(
      this.categoryModel.findByIdAndUpdate(id, category, { new: true }).exec(),
    ).pipe(
      map((doc) => (doc && (doc.toObject() as UpdatedCategoryDto)) || null),
      catchError((err) => {
        if (err?.code === 11000)
          throw new ConflictException('Category already exists')
        throw new Error('Database Error: ' + err.message)
      }),
    )
  }

  delete(id: string): Observable<{ _id: string; name: string } | null> {
    return from(this.categoryModel.findByIdAndDelete(id).exec()).pipe(
      map(
        (doc) =>
          (doc && (doc.toObject() as { _id: string; name: string })) || null,
      ),
      catchError((err) => {
        throw new Error('Database Error: ' + err.message)
      }),
    )
  }
}
