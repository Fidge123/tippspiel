import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { Leaderboard } from './leaderboard.entity';
import { ScoreboardModule } from 'src/scoreboard/scoreboard.module';
import { UserModule } from 'src/user/user.module';
import { TippModule } from 'src/tipp/tipp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Leaderboard]),
    ScoreboardModule,
    UserModule,
    TippModule,
  ],
  providers: [LeaderboardService],
  controllers: [LeaderboardController],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
