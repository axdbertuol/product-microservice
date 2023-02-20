import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ProductsModule } from './products/product.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    ProductsModule,
    MongooseModule.forRoot(process.env.DATABASE_URL ?? '', {
      useNewUrlParser: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
