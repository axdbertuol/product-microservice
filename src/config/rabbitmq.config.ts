import { registerAs } from '@nestjs/config'
import { IsOptional, IsString, IsUrl, Matches, isString } from 'class-validator'
import validateConfig from '../utils/validate-config'
import { RabbitMQConfig } from './types'

class EnvironmentVariablesValidator {
  @IsOptional()
  @IsString()
  @Matches(/^amqp.*/i)
  RABBITMQ_URL?: string
}

export default registerAs<RabbitMQConfig>('rabbitmq', () => {
  validateConfig(process.env, EnvironmentVariablesValidator)
  return {
    rabbitMqUrl: process.env.RABBITMQ_URL,
  }
})
