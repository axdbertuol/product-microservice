import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Channel, ConsumeMessage, Options } from 'amqplib'
import { formatInTimeZone } from 'date-fns-tz'

@Injectable()
export class RabbitService implements OnModuleInit {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async onModuleInit() {
    await this.amqpConnection.channel.assertExchange(
      'product_inner_exchange',
      'direct',
    )
  }

  async handleMessage({
    message,
    exchangeName,
    exchangeType,
    routingKey,
    exchangeOpts,
    publishOpts,
  }: {
    message: ConsumeMessage
    exchangeName?: string
    exchangeType?: string
    routingKey?: string
    exchangeOpts?: Options.AssertExchange
    publishOpts?: Options.Publish
  }) {
    const channel = this.amqpConnection.channel
    const currentDateTime = formatInTimeZone(
      new Date(),
      'America/Sao_Paulo',
      'yyyy-MM-dd HH:mm:ss zzz',
    )
    const exName = 'product_inner_exchange'
    const exType = exchangeType ?? 'direct'
    const routKey = routingKey ?? ''

    await channel.assertExchange(exName, exType, {
      ...exchangeOpts,
    })
    console.log('publishing>' + exName, exType, routKey)
    channel.publish(exName, routKey, message.content, {
      contentType: 'application/json',
      timestamp: Date.now(),
      correlationId: message.properties.correlationId,
      expiration: 5000,
      ...publishOpts,
    })
  }

  getChannel(): Channel {
    return this.amqpConnection.channel
  }
}
