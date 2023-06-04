import { IsNotEmpty, MinLength } from 'class-validator'
export class CreateCategoryDto {
  @MinLength(2, { message: 'Name should have at least 2 characters' })
  @IsNotEmpty()
  name: string
}

export type CreatedCategoryDto = CreateCategoryDto | { _id: string }
