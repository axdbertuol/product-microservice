import { Injectable } from '@nestjs/common'
import { CategoryService } from './category.service'
import { RabbitService } from './rabbitmq.service'
import { ProductService } from './product.service'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { ConsumeMessage } from 'amqplib'
import { Message } from 'kommshop-types'

@Injectable()
export class ProductMessagingService {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly rabbitService: RabbitService,
  ) {}
  @RabbitSubscribe({
    routingKey: 'product.fetch',
    exchange: 'product_direct_exchange',
    queueOptions: {
      durable: false,
    },
  })
  async interceptProductFetch(
    msg: Message.ProductContent,
    amqpMsg: ConsumeMessage,
  ) {
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
