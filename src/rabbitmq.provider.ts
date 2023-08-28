import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { connect, Connection, Channel, Options } from 'amqplib'
import { formatInTimeZone } from 'date-fns-tz'

@Injectable()
export class RabbitMQProvider implements OnModuleInit, OnModuleDestroy {
  private connection: Connection
  private channel: Channel
  private productUpdatesExchange: string
  private productRoutingKey: string

  constructor(@Inject('RABBITMQ_UPDATE_SERVICE') private client: ClientProxy) {}

  async onModuleInit() {
    if (!this.channel) {
      await this.connect()
      this.productUpdatesExchange = process.env.PRODUCT_UPDATES_EXCHANGE ?? ''
      this.productRoutingKey = process.env.PRODUCT_ROUTING_KEY ?? ''
    }
  }
  onModuleDestroy() {
    this.closeConnection()
  }

  private async connect() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const amqpUrl = process.env.RABBITMQ_URL!
      this.connection = await connect(amqpUrl)
      this.channel = await this.connection.createChannel()
      console.log('Connected to RabbitMQ')
    } catch (error) {
      console.error('Failed to connect to RabbitMQ', error)
    }
  }

  async sendMessage(
    payload: any,
    message: string,
    exchangeName?: string,
    exchangeType?: string,
    routingKey?: string,
    exchangeOpts?: Options.AssertExchange,
    publishOpts?: Options.Publish,
  ) {
    const currentDateTime = formatInTimeZone(
      new Date(),
      'America/Sao_Paulo',
      'yyyy-MM-dd HH:mm:ss zzz',
    )
    const exName = exchangeName ?? this.productUpdatesExchange
    const exType = exchangeType ?? 'direct'
    const routKey = routingKey ?? this.productRoutingKey

    await this.channel.assertExchange(exName, exType, {
      durable: true,
      ...exchangeOpts,
    })
    console.log('publishing>' + payload)
    this.channel.publish(
      exName,
      routKey,
      Buffer.from(
        JSON.stringify({
          payload: payload,
          message: message,
          timestamp: currentDateTime,
        }),
      ),
      { contentType: 'application/json', ...publishOpts },
    )
  }

  getChannel(): Channel {
    return this.channel
  }

  closeConnection() {
    this.connection.close()
  }
}
