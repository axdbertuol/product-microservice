import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { Module } from '@nestjs/common'
import { RabbitService } from './services/rabbitmq.service'
import { ConfigService } from '@nestjs/config'
import { AllConfigType, RabbitMQConfig } from './config/types'

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      inject: [ConfigService],
      useFactory(configService: ConfigService<AllConfigType>) {
        const isTesting =
          configService
            .get('app.nodeEnv', { infer: true })
            ?.toLocaleLowerCase() === 'test'
        const rabbitMqUrl = configService.get<string>('rabbitmq.rabbitMqUrl', {
          infer: true,
        })
        return {
          exchanges: [
            {
              // from broker to product microservice and vice-versa
              name: 'product_exchange',
              type: 'direct',
            },
          ],
          uri: rabbitMqUrl!,

          // enableControllerDiscovery: true,
          // channels: {
          //   'channel-product': {
          //     // prefetchCount: 15,
          //     default: true,
          //   },
          // },
          connectionInitOptions: {
            wait: true,
            timeout: 5000,
          },
          connectionManagerOptions: {
            connectionOptions: {
              timeout: 10000,
            },
          },
        }
      },
    }),
    RabbitModule,
  ],
  providers: [RabbitService],
  exports: [RabbitService],
})
export class RabbitModule {}
