import { Expose, Transform } from 'class-transformer'
import { IsString } from 'class-validator'
export class FindCategoryDto {
  @IsString()
  name?: string
  @Expose({ name: '_id' }) // Expose decorator to set the alias
  @IsString()
  id?: string

  // _id?: string
}

export class FoundCategoryDto {
  @IsString()
  name!: string

  @Expose({ name: 'id' }) // Expose decorator to set the alias
  @Transform(({ obj }) => {
    return obj._id.toString()
  }) // Transform decorator to convert the value to string
  @IsString()
  _id!: string

  // _id?: string
}
