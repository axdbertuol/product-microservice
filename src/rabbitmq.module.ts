import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { RabbitMQProvider } from './rabbitmq.provider'

@Module({
  //   imports: [
  //     MongooseModule.forRootAsync({
  //       useFactory: (configService: ConfigService) => ({
  //         uri:
  //           configService.get<string>('NODE_ENV') === 'test'
  //             ? configService.get<string>('DATABASE_TEST_URL')
  //             : configService.get<string>('DATABASE_URL'),
  //       }),
  //       inject: [ConfigService],
  //     }),
  //   ],
  providers: [RabbitMQProvider],
  exports: [RabbitMQProvider],
})
export class RabbitMQModule {}
