import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { Module } from '@nestjs/common'
import { RabbitService } from './services/rabbitmq.service'

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          // from broker to product microservice and vice-versa
          name: 'product_inner_exchange',
          type: 'direct',
        },
      ],
      uri: 'amqp://rabbitmq:5672',
      // enableControllerDiscovery: true,
      channels: {
        'channel-product': {
          prefetchCount: 15,
          default: true,
        },
      },
      connectionInitOptions: {
        // wait: false,
        timeout: 5000,
      },
      connectionManagerOptions: {
        connectionOptions: {
          timeout: 10000,
        },
      },
    }),
    RabbitModule,
  ],
  providers: [RabbitService],
  exports: [RabbitService],
})
export class RabbitModule {}
