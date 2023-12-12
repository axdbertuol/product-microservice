import { Expose, Transform } from 'class-transformer'
import { IsString, MinLength } from 'class-validator'

export class UpdateCategoryDto {
  @IsString()
  @MinLength(2)
  @Transform(({ value }) => {
    const words = value
      .trim()
      .split(' ')
      .filter((w: string) => /[a-zA-Z0-9]/.test(w)) as string[]
    const first = words.shift()
    const firstWord = first?.at(0)?.toUpperCase().concat(first.substring(1))

    return (firstWord + ' ' + words.join(' ')).trim()
  })
  name!: string
}
export class UpdatedCategoryDto extends UpdateCategoryDto {
  @Expose({ name: 'id' })
  @Transform(({ obj }) => {
    return obj._id.toString()
  }) // Transform decorator to convert the value to string
  @IsString()
  _id?: string
}
