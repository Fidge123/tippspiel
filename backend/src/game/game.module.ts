import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Game } from './game.entity';
import { TeamModule } from 'src/team/team.module';
import { ScoreboardModule } from 'src/scoreboard/scoreboard.module';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), TeamModule, ScoreboardModule],
  providers: [GameService],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}
