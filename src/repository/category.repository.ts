import { HttpStatus, Injectable } from '@nestjs/common'
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
import {
  ERRORS,
  FROM,
  KBaseException,
} from 'src/filters/exceptions/base-exception'

@Injectable()
export class CategoryRepository implements CRUD {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  find(id: string): Observable<FindCategoryDto | null> {
    return from(this.categoryModel.findById(id).exec()).pipe(
      map(
        (doc) =>
          (doc &&
            (doc.toObject({ flattenObjectIds: true }) as FindCategoryDto)) ||
          null,
      ),
      catchError((err) => {
        throw new KBaseException(
          FROM.repo,
          ERRORS.unexpected,
          HttpStatus.INTERNAL_SERVER_ERROR,
          err.path,
        )
      }),
    )
  }

  findByName<T extends FindCategoryDto>(categoryName: string): Observable<T[]> {
    return from(
      this.categoryModel
        .find({ name: { $regex: categoryName, $options: 'i' } })
        .exec(),
    ).pipe(
      map((docs) =>
        docs.map(
          (doc) =>
            (doc && (doc.toObject({ flattenObjectIds: true }) as T)) || null,
        ),
      ),
      catchError((err) => {
        throw new KBaseException(
          FROM.repo,
          ERRORS.unexpected,
          HttpStatus.INTERNAL_SERVER_ERROR,
          err.path,
        )
      }),
    )
  }

  findAll(): Observable<FindCategoryDto[]> {
    return from(this.categoryModel.find().exec()).pipe(
      map((docs) =>
        docs.map(
          (doc) => doc.toObject({ flattenObjectIds: true }) as FindCategoryDto,
        ),
      ),
      catchError((err) => {
        throw new KBaseException(
          FROM.repo,
          ERRORS.unexpected,
          HttpStatus.INTERNAL_SERVER_ERROR,
          err.path,
        )
      }),
    )
  }

  create(category: CreateCategoryDto): Observable<CreatedCategoryDto[]> {
    return from(this.categoryModel.create([category])).pipe(
      map(
        (doc) =>
          (doc &&
            doc.map(
              (d) =>
                d.toObject({ flattenObjectIds: true }) as CreatedCategoryDto,
            )) ||
          null,
      ),
      catchError((err) => {
        if (err?.code === 11000)
          throw new KBaseException(
            FROM.repo,
            ERRORS.conflict,
            HttpStatus.CONFLICT,
            err.path,
          )
        throw new KBaseException(
          FROM.repo,
          ERRORS.unexpected,
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
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
      map(
        (doc) =>
          (doc &&
            (doc.toObject({ flattenObjectIds: true }) as UpdatedCategoryDto)) ||
          null,
      ),
      catchError((err) => {
        if (err?.code === 11000)
          throw new KBaseException(
            FROM.repo,
            ERRORS.conflict,
            HttpStatus.CONFLICT,
            err.path,
          )
        throw new KBaseException(
          FROM.repo,
          ERRORS.unexpected,
          HttpStatus.INTERNAL_SERVER_ERROR,
          err.path,
        )
      }),
    )
  }

  delete(id: string): Observable<{ _id: string; name: string } | null> {
    return from(this.categoryModel.findByIdAndDelete(id).exec()).pipe(
      map(
        (doc) =>
          (doc &&
            (doc.toObject({ flattenObjectIds: true }) as {
              _id: string
              name: string
            })) ||
          null,
      ),
      catchError((err) => {
        throw new KBaseException(
          FROM.repo,
          ERRORS.unexpected,
          HttpStatus.INTERNAL_SERVER_ERROR,
          err.path,
        )
      }),
    )
  }
}
