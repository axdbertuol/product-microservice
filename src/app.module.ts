import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ProductsModule } from './modules/product/product.module'
import { DatabaseModule } from './modules/database/database.module'
import databaseConfig from './config/database.config'
import appConfig from './config/app.config'
import rabbitmqConfig from './config/rabbitmq.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, rabbitmqConfig],
      cache: true,
    }),
    ProductsModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
