import { env } from 'node:process';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ScheduleService } from '../../src/schedule/schedule.service';
import { BetDataService } from '../../src/database/bet.service';
import { LeagueDataService } from '../../src/database/league.service';

export interface ReplayApp {
  app: INestApplication;
  schedule: ScheduleService;
  bets: BetDataService;
  leagues: LeagueDataService;
  tokenFor(user: { id: string; name: string; email: string }): string;
  close(): Promise<void>;
}

export async function bootReplayApp(databaseUrl: string): Promise<ReplayApp> {
  env.DATABASE_URL = databaseUrl;
  env.JWT_SECRET = 'replay-jwt-secret';
  env.REFRESH_SECRET = 'replay-refresh-secret';
  env.COOKIE_SECRET = 'replay-cookie-secret';
  env.SKIP_BACKUP = 'true';
  delete env.IMPORT_ON_BOOT;
  delete env.POSTMARK;

  // Imported only now: src/datasource.ts reads DATABASE_URL when app.module.ts
  // first loads it.
  const { AppModule } = await import('../../src/app.module');

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  const jwt = app.get(JwtService);

  return {
    app,
    schedule: app.get(ScheduleService),
    bets: app.get(BetDataService),
    leagues: app.get(LeagueDataService),
    tokenFor: (user) =>
      jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        { secret: env.JWT_SECRET, expiresIn: '1y' },
      ),
    close: () => app.close(),
  };
}
