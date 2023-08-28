import { Injectable } from '@nestjs/common'
import { CategoryService } from './category.service'
import { RabbitService } from './rabbitmq.service'
import { ProductService } from './product.service'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { ConsumeMessage } from 'amqplib'
import { MessageContent } from 'src/types/base'

@Injectable()
export class ProductMessagingService {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly rabbitService: RabbitService,
  ) {}
  @RabbitSubscribe({
    routingKey: 'product.fetch',
    exchange: 'product_inner_exchange',
    createQueueIfNotExists: true,
    queueOptions: {
      durable: false,
    },
  })
  async interceptProductFetch(msg: MessageContent, amqpMsg: ConsumeMessage) {
    this.productService.findAll(msg?.category ?? undefined).subscribe({
      next: async (result) => {
        const newMessage = {
          ...amqpMsg,
          properties: {
            ...amqpMsg.properties,
            timestamp: Date.now(),
            // replyTo: undefined,
          },
          fields: {
            ...amqpMsg.fields,
          },
          content: Buffer.from(JSON.stringify(result)),
        } as ConsumeMessage
        console.log('intercepted2', newMessage, amqpMsg)
        await this.rabbitService.handleMessage({
          message: newMessage,
          routingKey: 'product.fetch.response',
        })
      },
    })
  }
}
