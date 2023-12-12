import { Expose, Transform } from 'class-transformer'
import { IsNotEmpty, MinLength } from 'class-validator'
export class CreateCategoryDto {
  @MinLength(2, { message: 'Name should have at least 2 characters' })
  @IsNotEmpty({ message: 'Name should have at least 2 characters' })
  name!: string
}

export class CreatedCategoryDto extends CreateCategoryDto {
  @Expose({ name: 'id' })
  @Transform(({ obj }) => {
    return obj._id.toString()
  })
  _id!: string
}
