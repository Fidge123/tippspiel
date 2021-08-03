import { env } from 'process';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScoreboardEntity } from './scoreboard/scoreboard.entity';
import { ByeEntity } from './schedule/bye.entity';
import { GameEntity } from './schedule/game.entity';
import { WeekEntity } from './schedule/week.entity';
import { TeamEntity } from './schedule/team.entity';
import { Tipp } from './tipp/tipp.entity';
import { User } from './user/user.entity';
import { ScoreboardModule } from './scoreboard/scoreboard.module';
import { TippModule } from './tipp/tipp.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ScheduleModule as SchedulerModule } from '@nestjs/schedule';

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
        Tipp,
        User,
      ],
      synchronize: true,
      // ssl: !env.DATABASE_URL.includes('localhost'),
      // extra: {
      //   ssl: { rejectUnauthorized: false },
      // },
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
