import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TeamController } from './team.controller';
import { DatabaseModule } from '../database/database.module';
import { DivisionController } from './division.controller';

@Module({
  imports: [DatabaseModule],
  providers: [ScheduleService],
  controllers: [ScheduleController, TeamController, DivisionController],
})
export class ScheduleModule {}
