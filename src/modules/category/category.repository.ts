import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, isObjectIdOrHexString } from 'mongoose'
import { CRUD } from '../../types/base'
import { Category, CategoryDocument } from './category.entity'
import {
  CreateCategoryDto,
  CreatedCategoryDto,
} from '../../dto/create-category.dto'
import { Observable, from } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { FoundCategoryDto } from '../../dto/find-category.dto'
import { UpdatedCategoryDto } from '../../dto/update-category.dto'
import {
  ERRORS,
  FROM,
  KBaseException,
} from '../../filters/exceptions/base-exception'
import { plainToInstance } from 'class-transformer'

@Injectable()
export class CategoryRepository implements CRUD {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  find(value: string): Observable<FoundCategoryDto | null> {
    const query = isObjectIdOrHexString(value)
      ? { _id: value }
      : { name: value }
    return from(this.categoryModel.findOne({ ...query }).exec()).pipe(
      map(
        (doc) =>
          doc &&
          plainToInstance(
            FoundCategoryDto,
            doc.toJSON({ flattenObjectIds: true }),
          ),
      ),

      catchError((err) => {
        throw new KBaseException(
          FROM.repo,
          ERRORS.unexpected,
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            message: err.message,
            path: err.path,
          },
        )
      }),
    )
  }

  findByName(categoryName: string | null): Observable<FoundCategoryDto[]> {
    return from(
      this.categoryModel
        .find({ name: { $regex: categoryName, $options: 'i' } })
        .exec(),
    ).pipe(
      map((docs) =>
        plainToInstance<FoundCategoryDto, FoundCategoryDto | null>(
          FoundCategoryDto,
          docs.map(
            (doc) =>
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              (doc && doc.toJSON({ flattenObjectIds: true })) || null,
          ),
        ),
      ),
      catchError((err) => {
        throw new KBaseException(
          FROM.repo,
          ERRORS.unexpected,
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            message: err.message,
            path: err.path,
          },
        )
      }),
    )
  }

  findAll(): Observable<FoundCategoryDto[]> {
    return from(this.categoryModel.find().exec()).pipe(
      map((docs) =>
        plainToInstance<FoundCategoryDto, FoundCategoryDto | null>(
          FoundCategoryDto,
          docs.map(
            (doc) =>
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              (doc && doc.toJSON({ flattenObjectIds: true })) || null,
          ),
        ),
      ),
      catchError((err) => {
        throw new KBaseException(
          FROM.repo,
          ERRORS.unexpected,
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            message: err.message,
            path: err.path,
          },
        )
      }),
    )
  }

  create(category: CreateCategoryDto): Observable<CreatedCategoryDto[]> {
    return from(this.categoryModel.create([category])).pipe(
      map((docs) =>
        plainToInstance<CreatedCategoryDto, CreatedCategoryDto | null>(
          CreatedCategoryDto,
          docs.map(
            (doc) => (doc && doc.toJSON({ flattenObjectIds: true })) || null,
          ),
        ),
      ),
      catchError((err) => {
        if (err?.code === 11000)
          throw new KBaseException(
            FROM.repo,
            ERRORS.conflict,
            HttpStatus.CONFLICT,
            {
              message: err.message,
              path: err.path,
            },
          )
        throw new KBaseException(
          FROM.repo,
          ERRORS.unexpected,
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            message: err.message,
            path: err.path,
          },
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
      map((doc) => {
        return (
          (doc &&
            plainToInstance(
              UpdatedCategoryDto,
              doc.toJSON({ flattenObjectIds: true }),
            )) ||
          null
        )
      }),
      catchError((err) => {
        if (err?.code === 11000)
          throw new KBaseException(
            FROM.repo,
            ERRORS.conflict,
            HttpStatus.CONFLICT,
            {
              message: err.message,
              path: err.path,
            },
          )
        throw new KBaseException(
          FROM.repo,
          ERRORS.unexpected,
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            message: err.message,
            path: err.path,
          },
        )
      }),
    )
  }

  delete(id: string): Observable<UpdatedCategoryDto | null> {
    return from(
      this.categoryModel
        .findByIdAndDelete(id, { includeResultMetadata: true })
        .exec(),
    ).pipe(
      map((doc) => {
        if (doc?.ok) {
          return plainToInstance(UpdatedCategoryDto, doc.value?.toJSON())
        }
        return null
      }),
      catchError((err) => {
        throw new KBaseException(
          FROM.repo,
          ERRORS.unexpected,
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            message: err.message,
            path: err.path,
          },
        )
      }),
    )
  }
}
