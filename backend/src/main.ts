import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true })
  app.enableCors({ origin: true, credentials: true })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' })
  const port = process.env.PORT || 3002
  await app.listen(port)
  console.log(`Vault Kicks backend running on http://localhost:${port}`)
}
bootstrap()
