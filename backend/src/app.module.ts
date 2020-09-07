import { env } from 'process';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scoreboard } from './scoreboard/scoreboard.entity';
import { Tipp } from './tipp/tipp.entity';
import { ScoreboardModule } from './scoreboard/scoreboard.module';
import { TippModule } from './tipp/tipp.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: env.DATABASE_URL,
      entities: [Scoreboard, Tipp],
      synchronize: true,
    }),
    ScoreboardModule,
    TippModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
