import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AllConfigType } from 'src/config/types'
import { DatabaseService } from './database.service'
import { IsExist } from './is-exists.validator'
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        connectionFactory: (connection) => {
          connection.plugin(() => import('mongoose-autopopulate'))
          return connection
        },
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
