import { Injectable, OnModuleInit } from '@nestjs/common'
import { connect, Connection, Channel } from 'amqplib'
import { Observable, from } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

@Injectable()
export class RabbitMQProvider implements OnModuleInit {
  private connection: Connection
  private channel: Channel

  async onModuleInit() {
    if (!this.channel) {
      await this.connect()
    }
  }

  private async connect() {
    try {
      const amqpUrl = 'amqp://192.168.64.2:5672'
      this.connection = await connect(amqpUrl)
      this.channel = await this.connection.createChannel()
      console.log('Connected to RabbitMQ')
    } catch (error) {
      console.error('Failed to connect to RabbitMQ', error)
    }
  }

  getChannel(): Channel {
    return this.channel
  }

  closeConnection() {
    this.connection.close()
  }
}
