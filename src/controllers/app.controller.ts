import { Controller, Get } from '@nestjs/common'
import { Channel } from 'amqplib'
import { RabbitMQProvider } from '../rabbitmq.provider'

@Controller()
export class AppController {
  constructor(private readonly rabbitMQProvider: RabbitMQProvider) {}

  @Get('rabbitmq-test-connect')
  async getHello(): Promise<string> {
    const channel: Channel = this.rabbitMQProvider.getChannel()
    console.log('passeou')
    const exchangeName = 'my_exchange'
    const routingKey = 'product_microservice_key'

    await channel.assertExchange(exchangeName, 'direct', { durable: true })
    channel.publish(exchangeName, routingKey, Buffer.from('oi'))

    console.log('Message sent successfully')

    return 'Hello World!'
  }
}
