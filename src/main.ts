import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from './validation'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000)
  console.log('Server listening on 3000')
}
bootstrap()
