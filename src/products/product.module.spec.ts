import { Test, TestingModule } from '@nestjs/testing'
import { MongooseModule } from '@nestjs/mongoose'
import { ProductSchema } from './entities/product.entity'
import { CategorySchema } from './entities/category.entity'
import { ProductService } from './services/product.service'
import { ProductController } from './controllers/product.controller'
import { ProductRepository } from './repository/product.repository'
import { ProductsModule } from './product.module'

describe('ProductsModule', () => {
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(process.env.DATABASE_URL ?? ''),
        MongooseModule.forFeature([
          { name: 'Product', schema: ProductSchema },
          { name: 'Category', schema: CategorySchema },
        ]),
        ProductsModule,
      ],
      controllers: [ProductController],
      providers: [ProductService, ProductRepository],
    }).compile()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
  })

  it('should initialize ProductService', () => {
    const productService = module.get<ProductService>(ProductService)
    expect(productService).toBeDefined()
  })

  it('should initialize ProductController', () => {
    const productController = module.get<ProductController>(ProductController)
    expect(productController).toBeDefined()
  })

  it('should initialize ProductRepository', () => {
    const productRepository = module.get<ProductRepository>(ProductRepository)
    expect(productRepository).toBeDefined()
  })
})
