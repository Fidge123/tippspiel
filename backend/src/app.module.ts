import { env } from 'process';

import { Module } from '@nestjs/common';
import { AppController } from './controller/app.controller';
import { AppService } from './service/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: env.DATABASE_URL,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
