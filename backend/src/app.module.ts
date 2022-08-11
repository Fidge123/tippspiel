import { env } from 'process';

import { Module } from '@nestjs/common';
import { ScheduleModule as SchedulerModule } from '@nestjs/schedule';
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
} from './database/entity';
import { AuthModule } from './auth/auth.module';
import { BetModule } from './bet/bet.module';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from './schedule/schedule.module';
import { UserModule } from './user/user.module';

const extra = env.DATABASE_URL.includes('localhost')
  ? {
      // synchronize: true,
      ssl: false,
    }
  : {
      extra: {
        ssl: {
          rejectUnauthorized: false,
          enabled: true,
        },
      },
    };

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: env.DATABASE_URL,
      entities: [
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
      ],
      ...extra,
    }),
    SchedulerModule.forRoot(),
    DatabaseModule,
    BetModule,
    UserModule,
    AuthModule,
    ScheduleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
