import { Test, TestingModule } from '@nestjs/testing'
import { ConsumeMessage } from 'amqplib'
import { of } from 'rxjs'
import { CategoryService } from '../../services/category.service'
import { ProductMessagingService } from '../../services/product-messaging.service'
import { ProductService } from '../../services/product.service'
import { RabbitService } from '../../services/rabbitmq.service'
import { FoundProductDto } from '@/dto/find-product.dto'

jest.mock('../../services/category.service')
describe('ProductMessagingService', () => {
  let productMessagingService: ProductMessagingService
  let productService: ProductService
  let rabbitService: RabbitService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductMessagingService,
        {
          provide: ProductService,
          useValue: {
            findAll: jest.fn(), // Mock the findAll method
          },
        },
        {
          provide: RabbitService,
          useValue: {
            publishMessage: jest.fn(), // Mock the publishMessage method
            serializeContent: jest.fn(), // Mock the serializeContent method
          },
        },
        {
          provide: CategoryService,
          useValue: {},
        },
      ],
    }).compile()

    productMessagingService = module.get<ProductMessagingService>(
      ProductMessagingService,
    )
    productService = module.get<ProductService>(ProductService)
    rabbitService = module.get<RabbitService>(RabbitService)
  })

  it('should be defined', () => {
    expect(productMessagingService).toBeDefined()
  })

  it('should intercept and publish product fetch response', async () => {
    // Mock dependencies' behavior
    const findAllResult = [{ _id: '1', name: 'Product 1' } as FoundProductDto]
    const serializedResult = Buffer.from(JSON.stringify(findAllResult))
    jest.spyOn(productService, 'findAll').mockReturnValue(of(findAllResult))
    jest
      .spyOn(rabbitService, 'serializeContent')
      .mockReturnValue(serializedResult)

    // Mock the AMQP message and call the interceptProductFetch method
    const amqpMsg = { properties: {}, fields: {}, content: 'Message Content' }
    const msg = {
      category: 'Category',
      data: undefined,
    }

    await productMessagingService.interceptProductFetch(
      msg,
      amqpMsg as unknown as ConsumeMessage,
    )

    // Assertions
    expect(productService.findAll).toHaveBeenCalledWith('Category')
    expect(rabbitService.serializeContent).toHaveBeenCalledWith(findAllResult)
    expect(rabbitService.publishMessage).toHaveBeenCalledWith({
      message: expect.objectContaining({
        ...amqpMsg,
        content: serializedResult,
      }),
      routingKey: 'product.fetch.response',
    })
  })
})
