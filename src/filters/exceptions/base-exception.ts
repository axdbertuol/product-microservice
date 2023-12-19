import { HttpException } from '@nestjs/common'

export enum ERRORS {
  cast = 'castError',
  unexpected = 'unexpectedError',
  conflict = 'conflictError',
  invalidOrUndefinedData = 'invalidCategory',
}

export enum FROM {
  repo = 'repository',
  service = 'service',
  presave = 'presave',
}
export class KBaseException extends HttpException {
  constructor(
    from: FROM,
    errorEnum: ERRORS,
    status: number,
    options:
      | {
          message?: string
          path?: string
        }
      | undefined = undefined,
  ) {
    let json = ''
    try {
      const response = {
        origin: from,
        type: errorEnum,
        path: options?.path ?? undefined,
      }
      json = JSON.stringify(response)
    } catch (err) {
      console.error(err)
    }

    super(
      {
        cause: { error: json },
        ...(options?.message ? { message: options.message } : null),
      },
      status,
    )
  }

  declare cause: { error: string } | { errors?: Record<string, string[]> }
  name!: string
  message!: string
  stack?: string | undefined
}
