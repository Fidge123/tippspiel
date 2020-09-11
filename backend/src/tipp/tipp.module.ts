import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TippService } from './tipp.service';
import { TippController } from './tipp.controller';
import { Tipp } from './tipp.entity';
import { ScoreboardModule } from 'src/scoreboard/scoreboard.module';
import { LeaderboardController } from './leaderboard.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tipp]), ScoreboardModule, UserModule],
  providers: [TippService],
  controllers: [TippController, LeaderboardController],
})
export class TippModule {}
