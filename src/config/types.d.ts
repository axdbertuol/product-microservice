export type AppConfig = {
  nodeEnv: string
  name: string
  workingDirectory: string
  frontendDomain?: string
  backendDomain: string
  port: number
  apiPrefix: string
  fallbackLanguage: string
  headerLanguage: string
}

export type DatabaseConfig = {
  mongoUser?: string
  mongoPwd?: string
  databaseUrl?: string
  databaseTestUrl?: string
  databaseTestName?: string
}
export type AllConfigType = {
  app: AppConfig
  database: DatabaseConfig
  rabbitmq: RabbitMQConfig
}
export type RabbitMQConfig = {
  rabbitMqUrl?: string
}
