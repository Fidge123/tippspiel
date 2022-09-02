import { Module } from '@nestjs/common';
import { ScheduleModule as SchedulerModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BetModule } from './bet/bet.module';
import { DatabaseModule } from './database/database.module';
import { config } from './datasource';
import { ScheduleModule } from './schedule/schedule.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...config,
      autoLoadEntities: true,
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
