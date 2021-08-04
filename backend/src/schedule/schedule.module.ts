import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleService } from './schedule.service';
import { ByeEntity, WeekEntity, GameEntity, TeamEntity } from './entity';
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
