import { env } from 'process';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScoreboardEntity } from './scoreboard/scoreboard.entity';
import { Tipp } from './tipp/tipp.entity';
import { User } from './user/user.entity';
import { ScoreboardModule } from './scoreboard/scoreboard.module';
import { TippModule } from './tipp/tipp.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: env.DATABASE_URL,
      entities: [ScoreboardEntity, Tipp, User],
      synchronize: true,
      ssl: !env.DATABASE_URL.includes('localhost'),
      extra: {
        ssl: { rejectUnauthorized: false },
      },
    }),
    ScoreboardModule,
    TippModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
