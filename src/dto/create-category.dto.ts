import { IsNotEmpty, MinLength } from 'class-validator'
export class CreateCategoryDto {
  @MinLength(2, { message: 'Name should have at least 2 characters' })
  @IsNotEmpty({ message: 'Name should have at least 2 characters' })
  name: string
}

export type CreatedCategoryDto = CreateCategoryDto | { _id: string }
