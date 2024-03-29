import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BetEntity,
  BetDoublerEntity,
  ByeEntity,
  DivisionEntity,
  DivisionBetEntity,
  GameEntity,
  LeagueEntity,
  ResetEntity,
  SuperbowlBetEntity,
  TeamEntity,
  UserEntity,
  VerifyEntity,
  WeekEntity,
} from './entity/';
import { BetDataService } from './bet.service';
import { ScheduleDataService } from './schedule.service';
import { UserDataService } from './user.service';
import { LeagueDataService } from './league.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BetEntity,
      BetDoublerEntity,
      ByeEntity,
      DivisionEntity,
      DivisionBetEntity,
      GameEntity,
      LeagueEntity,
      ResetEntity,
      SuperbowlBetEntity,
      TeamEntity,
      UserEntity,
      VerifyEntity,
      WeekEntity,
    ]),
  ],
  providers: [
    BetDataService,
    ScheduleDataService,
    UserDataService,
    LeagueDataService,
  ],
  exports: [
    BetDataService,
    ScheduleDataService,
    UserDataService,
    LeagueDataService,
  ],
})
export class DatabaseModule {}
