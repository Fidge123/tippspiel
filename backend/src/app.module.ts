import { env } from 'process';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScoreboardEntity } from './scoreboard/scoreboard.entity';
import {
  ByeEntity,
  WeekEntity,
  GameEntity,
  TeamEntity,
} from './schedule/entity';
import { TippEntity } from './tipp/tipp.entity';
import { UserEntity, ResetEntity, VerifyEntity } from './user/entity';
import { ScoreboardModule } from './scoreboard/scoreboard.module';
import { TippModule } from './tipp/tipp.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ScheduleModule as SchedulerModule } from '@nestjs/schedule';

const extra = env.DATABASE_URL.includes('localhost')
  ? { ssl: false }
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
        ScoreboardEntity,
        ByeEntity,
        GameEntity,
        WeekEntity,
        TeamEntity,
        TippEntity,
        UserEntity,
        ResetEntity,
        VerifyEntity,
      ],
      synchronize: true,
      ...extra,
    }),
    SchedulerModule.forRoot(),
    ScoreboardModule,
    TippModule,
    UserModule,
    AuthModule,
    ScheduleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
