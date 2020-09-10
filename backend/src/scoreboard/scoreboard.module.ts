import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreboardService } from './scoreboard.service';
import { ScoreboardController } from './scoreboard.controller';
import { ScoreboardEntity } from './scoreboard.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScoreboardEntity])],
  providers: [ScoreboardService],
  controllers: [ScoreboardController],
  exports: [ScoreboardService],
})
export class ScoreboardModule {}
