import { registerAs } from '@nestjs/config'
import { IsOptional, IsString, IsUrl, Matches } from 'class-validator'
import validateConfig from 'src/utils/validate-config'
import { RabbitMQConfig } from './types'

class EnvironmentVariablesValidator {
  @IsOptional()
  @Matches(/^amqp.*/i)
  RABBITMQ_URL: string
}

export default registerAs<RabbitMQConfig>('rabbitmq', () => {
  validateConfig(process.env, EnvironmentVariablesValidator)

  return {
    rabbitMqUrl: process.env.RABBITMQ_URL,
  }
})
