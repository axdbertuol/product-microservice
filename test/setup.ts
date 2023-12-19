import {
  ClassSerializerInterceptor,
  HttpServer,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common'
import { HttpAdapterHost, Reflector } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import {
  CreateCategoryDto,
  CreateProductDto,
  CreatedCategoryDto,
} from 'kommshop-types'
import { Collection, Connection } from 'mongoose'
import { concatMap, from, lastValueFrom, map, mergeMap } from 'rxjs'
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/filters/all-exceptions.filter'
import { DatabaseService } from '../src/modules/database/database.service'
import validationOptions from '../src/utils/validation-options'

let app: INestApplication
let dbConnection: Connection
let httpServer: HttpServer
const createProductDto = {
  name: 'teste',
  price: 1,
  category: 'Test Category',
  description: 'Test Description',
}
const createCategoryDto: CreateCategoryDto = {
  name: 'Test Category',
}
let productCollection: Collection<any>
export const mapCategoryNameToId: Map<string, string> = new Map()
let categoriesCollection: Collection<any>
const mockProducts = Array.from({ length: 10 }, () => ({
  ...createProductDto,
})).map((prod, index) => ({
  ...prod,
  name: prod.name + index,
  price: (index + 1) * prod.price * 10,
}))

mockProducts.push({
  ...mockProducts[0],
  name: 'fool',
})

async function setup() {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()
  expect(moduleFixture).toBeDefined()
  app = moduleFixture.createNestApplication()
  app.useGlobalPipes(new ValidationPipe(validationOptions))
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      enableCircularCheck: true,
    }),
  )
  const httpAdapter = app.get(HttpAdapterHost)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))
  app.useGlobalPipes(new ValidationPipe(validationOptions))

  await app.init()
  dbConnection = moduleFixture.get(DatabaseService).getDbHandle()
  httpServer = app.getHttpServer()
  categoriesCollection = dbConnection.collection('categories')
  productCollection = dbConnection.collection('products')

  await lastValueFrom(
    from(categoriesCollection.insertOne(createCategoryDto)).pipe(
      mergeMap((v) => {
        mapCategoryNameToId.set('Test Category', v.insertedId.toString())
        return productCollection.insertMany(
          mockProducts.map((p) => ({ ...p, category: v.insertedId })),
          {
            ordered: false,
          },
        )
      }),
    ),
  )
}
beforeAll(async () => {
  await setup().then(() => {
    console.log('setup completed')
  })
})

function teardown() {
  const observables = [
    productCollection.deleteMany({}),
    categoriesCollection.deleteMany({}),
    app.close(),
  ]
  return from(observables).pipe(
    concatMap((obs) => obs),
    map((obs) => {
      console.log('teardownobs', obs)
    }),
  )
}
afterAll(async () => {
  console.log('afterAll teardown')
  await lastValueFrom(teardown())
})
export {
  app,
  categoriesCollection,
  createCategoryDto,
  createProductDto,
  dbConnection,
  httpServer,
  mockProducts,
  productCollection,
}
