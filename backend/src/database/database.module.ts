import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BetEntity,
  ByeEntity,
  DivisionEntity,
  DivisionBetEntity,
  GameEntity,
  LeagueEntity,
  ResetEntity,
  TeamEntity,
  UserEntity,
  VerifyEntity,
  WeekEntity,
} from './entity/';
import { BetDataService } from './bet.service';
import { ScheduleDataService } from './schedule.service';
import { UserDataService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BetEntity,
      ByeEntity,
      DivisionEntity,
      DivisionBetEntity,
      GameEntity,
      LeagueEntity,
      ResetEntity,
      TeamEntity,
      UserEntity,
      VerifyEntity,
      WeekEntity,
    ]),
  ],
  providers: [BetDataService, ScheduleDataService, UserDataService],
  exports: [BetDataService, ScheduleDataService, UserDataService],
})
export class DatabaseModule {}
