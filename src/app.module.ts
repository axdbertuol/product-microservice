import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './controllers/app.controller'
import { AppService } from './services/app.service'
import { ProductsModule } from './product.module'
import { DatabaseModule } from './database/database.module'
import { RabbitMQProvider } from './rabbitmq.provider'
import { RabbitMQModule } from './rabbitmq.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductsModule,
    DatabaseModule,
    RabbitMQModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [RabbitMQModule],
})
export class AppModule {}
