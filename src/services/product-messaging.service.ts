import { RabbitRPC, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import type { ConsumeMessage } from 'amqplib'
import { CategoryService } from './category.service'
import { ProductService } from './product.service'
import { RabbitService } from './rabbitmq.service'

@Injectable()
export class ProductMessagingService {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly rabbitService: RabbitService,
  ) {}
  @RabbitRPC({
    routingKey: 'product.fetch',
    exchange: 'product_exchange',
    queueOptions: {
      durable: false,
      autoDelete: true,
    },
  })
  async interceptProductFetch(msg: any, amqpMsg: ConsumeMessage) {
    this.productService.findAll(msg?.category ?? undefined).subscribe({
      next: async (result) => {
        const newMessage = {
          ...amqpMsg,
          properties: {
            ...amqpMsg.properties,
          },
          fields: {
            ...amqpMsg.fields,
          },
          content: this.rabbitService.serializeContent(result),
        } as ConsumeMessage
        await this.rabbitService.publishMessage({
          message: newMessage,
          routingKey: 'product.fetch.response',
        })
      },
      error: (err) => {
        console.log('Something went wrong while publishing', err)
      },
      complete: () => {
        console.log('Message sent')
      },
    })
  }
}
