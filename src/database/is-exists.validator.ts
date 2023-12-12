import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments'
import { Injectable } from '@nestjs/common'

import { InjectConnection } from '@nestjs/mongoose'
import { Connection } from 'mongoose'

@Injectable()
@ValidatorConstraint({ name: 'IsExist', async: true })
export class IsExist implements ValidatorConstraintInterface {
  constructor(
    @InjectConnection()
    private readonly dataSource: Connection,
  ) {}

  async validate(value: string, validationArguments: ValidationArguments) {
    console.log('asdasd', this.dataSource)
    const repository = validationArguments.constraints[0]
    const pathToProperty = validationArguments.constraints[1]
    const entity: unknown = await this.dataSource
      .collection(repository)
      .findOne({
        where: {
          [pathToProperty ? pathToProperty : validationArguments.property]:
            pathToProperty ? value?.[pathToProperty] : value,
        },
      })

    return Boolean(entity)
  }
}
