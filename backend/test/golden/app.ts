import { env } from 'node:process';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ScheduleService } from '../../src/schedule/schedule.service';
import { BetDataService } from '../../src/database/bet.service';
import { LeagueDataService } from '../../src/database/league.service';

export interface GoldenApp {
  app: INestApplication;
  schedule: ScheduleService;
  bets: BetDataService;
  leagues: LeagueDataService;
  tokenFor(user: { id: string; name: string; email: string }): string;
  close(): Promise<void>;
}

/**
 * Boots the real application against the throwaway database. Nothing is
 * mocked out here — the importer, the ORM and the HTTP layer are the ones
 * that ship; only `fetch` (the ESPN corpus) and Postmark (the stub recorder in
 * src/email.ts) are substituted.
 */
export async function bootGoldenApp(databaseUrl: string): Promise<GoldenApp> {
  env.DATABASE_URL = databaseUrl;
  env.JWT_SECRET = 'golden-master-jwt-secret';
  env.REFRESH_SECRET = 'golden-master-refresh-secret';
  env.COOKIE_SECRET = 'golden-master-cookie-secret';
  // Never write a recording back to the bucket, and never import on boot.
  env.SKIP_BACKUP = 'true';
  delete env.IMPORT_ON_BOOT;
  delete env.POSTMARK;

  // Imported only now: src/datasource.ts reads DATABASE_URL when it is first
  // evaluated, which is the moment app.module.ts is loaded.
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
