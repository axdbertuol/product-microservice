// import { HydratedDocument } from 'mongoose'
// import { ResultAsync } from 'neverthrow'

// export function wrapWithResultAsync<T>(errorMessage: string): MethodDecorator {
//   return function (
//     target: object,
//     propertyKey: string | symbol,
//     descriptor: PropertyDescriptor,
//   ) {
//     const originalMethod = descriptor.value

//     descriptor.value = function (...args: any[]) {
//       const resultAsync = ResultAsync.fromPromise(
//         originalMethod.apply(this, args),
//         (error: Error) => new Error(errorMessage + ' ' + error),
//       ) as ResultAsync<T, Error>

//       return resultAsync
//     }
//   }
// }
// export function mapToArrayObjects<T>(): MethodDecorator {
//   return function (
//     target: object,
//     propertyKey: string | symbol,
//     descriptor: PropertyDescriptor,
//   ) {
//     const originalMethod = descriptor.value

//     descriptor.value = function (...args: any[]) {
//       const result: ResultAsync<T, Error> = originalMethod
//         .apply(this, args)
//         .map((doc: HydratedDocument<T>) => doc.toObject())

//       return result
//     }
//   }
// }
// export const fromPromise = (err: string) => {
//   return (
//     target: any,
//     memberName: string,
//     propertyDescriptor: PropertyDescriptor,
//   ) => {
//     const originalMethod = propertyDescriptor.value
//     propertyDescriptor.value = function (
//       ...args: any[]
//     ): ResultAsync<any, any> {
//       const executionMethod = originalMethod.apply(this, args)
//       return ResultAsync.fromPromise(executionMethod, () => new Error(err))
//     }
//     return propertyDescriptor
//   }
// }
