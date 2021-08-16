import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { ScoreboardModule } from '../scoreboard/scoreboard.module';

import { BetService } from './bet.service';
import { BetController } from './bet.controller';
import { LeaderboardController } from './leaderboard.controller';

@Module({
  imports: [ScoreboardModule, DatabaseModule],
  providers: [BetService],
  controllers: [BetController, LeaderboardController],
})
export class BetModule {}
