import { env } from 'process';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScoreboardEntity } from './scoreboard/scoreboard.entity';
import { Tipp } from './tipp/tipp.entity';
import { ScoreboardModule } from './scoreboard/scoreboard.module';
import { TippModule } from './tipp/tipp.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: env.DATABASE_URL,
      entities: [ScoreboardEntity, Tipp],
      synchronize: true,
    }),
    ScoreboardModule,
    TippModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
