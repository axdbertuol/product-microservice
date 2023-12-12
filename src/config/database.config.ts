import { registerAs } from '@nestjs/config'
import { IsOptional, IsString, IsUrl, Matches } from 'class-validator'
import validateConfig from '../utils/validate-config'
import { DatabaseConfig } from './types'

class EnvironmentVariablesValidator {
  @IsOptional()
  @IsString()
  MONGO_USER!: string

  @IsOptional()
  @IsString()
  MONGO_PWD!: string

  @Matches(/^mongo.*/i)
  @IsOptional()
  DATABASE_URL!: string

  @Matches(/^mongo.*/i)
  @IsOptional()
  DATABASE_TEST_URL!: string

  @IsString()
  @IsOptional()
  DATABASE_TEST_NAME!: string
}

export default registerAs<DatabaseConfig>('database', () => {
  validateConfig(process.env, EnvironmentVariablesValidator)

  return {
    mongoUser: process.env.MONGO_USER,
    mongoPwd: process.env.MONGO_PWD,
    databaseUrl: process.env.DATABASE_URL,
    databaseTestUrl: process.env.DATABASE_TEST_URL,
    databaseTestName: process.env.DATABASE_TEST_NAME,
  }
})
