import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreboardService } from './scoreboard.service';
import { ScoreboardController } from './scoreboard.controller';
import { Scoreboard } from './scoreboard.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scoreboard])],
  providers: [ScoreboardService],
  controllers: [ScoreboardController],
})
export class ScoreboardModule {}
