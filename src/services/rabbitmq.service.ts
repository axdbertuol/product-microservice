import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Channel, ConsumeMessage, Options } from 'amqplib'

@Injectable()
export class RabbitService implements OnModuleInit {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async onModuleInit() {
    await this.amqpConnection.channel.assertExchange(
      'product_inner_exchange',
      'direct',
    )
  }

  async publishMessage({
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
    const channel = this.getChannel()
    const exName = exchangeName ?? 'product_direct_exchange'
    const exType = exchangeType ?? 'direct'
    const routKey = routingKey ?? ''

    await channel.assertExchange(exName, exType, {
      ...exchangeOpts,
    })
    console.log('publishing>' + exName, exType, routKey, message)
    channel.publish(exName, routKey, message.content, {
      contentType: 'application/json',
      timestamp: Date.now(),
      correlationId: message.properties.correlationId,
      expiration: 5000,
      ...publishOpts,
    })
  }

  async reply() {
    // return this.getChannel().publish()
  }

  serializeContent(content: any) {
    try {
      return Buffer.from(JSON.stringify(content))
    } catch (err) {
      console.error(err, content)
    }
  }

  getChannel(): Channel {
    return this.amqpConnection.channel
  }
}
