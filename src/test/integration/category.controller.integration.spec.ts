import { Test } from '@nestjs/testing'
import { HttpServer, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../app.module'
import { Connection } from 'mongoose'
import { DatabaseService } from '../../database/database.service'

describe('CategoryController integration', () => {
  let app: INestApplication
  let dbConnection: Connection
  let httpServer: HttpServer

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    expect(moduleFixture).toBeDefined()
    app = moduleFixture.createNestApplication()
    await app.init()
    dbConnection = moduleFixture
      .get<DatabaseService>(DatabaseService)
      .getDbHandle()
    httpServer = app.getHttpServer()
  })

  afterAll(async () => {
    await dbConnection.collection('categories').deleteMany({})
    await app.close()
  })

  beforeEach(async () => {
    await dbConnection.collection('categories').deleteMany({})
  })

  it('findAll', async () => {
    await dbConnection.collection('categories').insertOne({ name: 'teste' })
    dbConnection.collection('categories').find()
    const response = await request(httpServer).get('/categories')
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject([{ name: 'teste' }])
  })
})
