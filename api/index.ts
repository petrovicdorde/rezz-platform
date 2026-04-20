import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import express from 'express';
import type { IncomingMessage, ServerResponse } from 'http';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AppModule } = require('../apps/api/dist/app.module');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GlobalExceptionFilter } = require('../apps/api/dist/common/filters/http-exception.filter');

let cachedServer: ReturnType<typeof serverlessExpress>;

async function bootstrap() {
  if (cachedServer) return cachedServer;

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  await app.init();

  cachedServer = serverlessExpress({ app: expressApp });
  return cachedServer;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const server = await bootstrap();
  return server(req, res, () => {});
}
