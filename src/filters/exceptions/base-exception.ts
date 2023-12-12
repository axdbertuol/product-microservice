import { HttpException } from '@nestjs/common'

export enum ERRORS {
  cast = 'castError',
  unexpected = 'unexpectedError',
  conflict = 'conflictError',
  invalidCat = 'invalidCategory',
}

export enum FROM {
  repo = 'repository',
  service = 'service',
}
export class KBaseException extends HttpException {
  constructor(from: FROM, errorEnum: ERRORS, status: number, path?: string) {
    let json = ''
    try {
      const response = {
        origin: from,
        type: errorEnum,
        path: path ?? undefined,
      }
      json = JSON.stringify(response)
    } catch (err) {
      console.error(err)
    }

    super(
      {
        cause: { error: json },
      },
      status,
    )
  }

  cause: { error: string } | { errors?: Record<string, string[]> }
  name: string
  message: string
  stack?: string | undefined
}
