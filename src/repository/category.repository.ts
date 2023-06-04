import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CRUD } from '../types/base.d'
import { Category, CategoryDocument } from '../entities/category.entity'
import {
  CreateCategoryDto,
  CreatedCategoryDto,
} from '../dto/create-category.dto'
import { Observable, throwError, from } from 'rxjs'
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
      catchError((err) => throwError(() => new Error(err))),
    )
  }

  findByName(categoryName: string): Observable<FindCategoryDto[]> {
    return from(this.categoryModel.find({ name: categoryName }).exec()).pipe(
      map((docs) =>
        docs.map((doc) => (doc && (doc.toObject() as FindCategoryDto)) || null),
      ),
      catchError((err) => throwError(() => new Error(err))),
    )
  }

  findAll(): Observable<FindCategoryDto[]> {
    return from(this.categoryModel.find().exec()).pipe(
      map((docs) => docs.map((doc) => doc.toObject() as FindCategoryDto)),
      catchError((err) => throwError(() => new Error(err))),
    )
  }

  create(category: CreateCategoryDto): Observable<CreatedCategoryDto> {
    return from(this.categoryModel.create(category)).pipe(
      map((doc) => doc.toObject() as CreatedCategoryDto),
      catchError((err) => throwError(() => new Error(err))),
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
      catchError((err) => throwError(() => new Error(err))),
    )
  }

  delete(id: string): Observable<{ _id: string; name: string } | null> {
    return from(this.categoryModel.findByIdAndDelete(id).exec()).pipe(
      map(
        (doc) =>
          (doc && (doc.toObject() as { _id: string; name: string })) || null,
      ),
      catchError((err) => throwError(() => new Error(err))),
    )
  }
}
