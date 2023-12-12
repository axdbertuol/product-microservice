import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { DatabaseService } from './database.service'
import { IsExist } from './is-exists.validator'
import { AllConfigType } from 'src/config/types'
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        uri:
          configService.get('app.nodeEnv', { infer: true }) === 'test'
            ? configService.get('database.databaseTestUrl', { infer: true })
            : configService.get('database.databaseUrl', { infer: true }),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [IsExist, DatabaseService],
  // exports: [DatabaseService, IsExist],
})
export class DatabaseModule {}
