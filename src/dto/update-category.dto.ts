export class UpdateCategoryDto {
  readonly name?: string
}
export type UpdatedCategoryDto = UpdateCategoryDto | { _id: string }
