import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { DatabaseService } from './database.service'
import { IsExist } from './is-exists.validator'
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('NODE_ENV') === 'test'
            ? configService.get<string>('DATABASE_TEST_URL')
            : configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [IsExist, DatabaseService],
  // exports: [DatabaseService, IsExist],
})
export class DatabaseModule {}
