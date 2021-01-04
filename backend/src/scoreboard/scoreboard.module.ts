import { env } from 'process';

import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';

import { ScoreboardService } from './scoreboard.service';
import { ScoreboardController } from './scoreboard.controller';
import { ScoreboardEntity } from './scoreboard.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScoreboardEntity]),
    CacheModule.register({
      store: redisStore,
      url: env.REDIS_URL,
      db: 0,
    }),
  ],
  providers: [ScoreboardService],
  controllers: [ScoreboardController],
  exports: [ScoreboardService],
})
export class ScoreboardModule {}
