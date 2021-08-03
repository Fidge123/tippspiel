import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleService } from './schedule.service';
import { WeekEntity } from './week.entity';
import { ByeEntity } from './bye.entity';
import { GameEntity } from './game.entity';
import { TeamEntity } from './team.entity';
import { ScheduleController } from './schedule.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WeekEntity, ByeEntity, GameEntity, TeamEntity]),
  ],
  providers: [ScheduleService],
  controllers: [ScheduleController],
  exports: [],
})
export class ScheduleModule {}
