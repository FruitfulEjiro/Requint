import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
    origin: '*',
    // origin: config.getOrThrow<string>('ALLOWED_ORIGIN').split(', '),
    allowedHeaders: ['Content-Type', 'Origin', 'Accept', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  app.use(cookieParser());

  app.set('trust proxy', 1);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
