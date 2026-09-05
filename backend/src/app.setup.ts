import { env } from 'node:process';
import { INestApplication } from '@nestjs/common';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

export function configureApp(app: INestApplication): void {
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser(env.COOKIE_SECRET));
  app.enableCors();
}
