import { Expose, Transform } from 'class-transformer'
import { IsString } from 'class-validator'
export class FindCategoryDto {
  @IsString()
  name: string

  @Expose({ name: 'id' }) // Expose decorator to set the alias
  @Transform((value) => value.toString()) // Transform decorator to convert the value to string
  @IsString()
  _id: string
}
