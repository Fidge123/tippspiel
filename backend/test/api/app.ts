import { env } from 'node:process';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { DataSource } from 'typeorm';
import { configureApp } from '../../src/app.setup';
import { BetDataService } from '../../src/database/bet.service';
import { LeagueDataService } from '../../src/database/league.service';
import { UserDataService } from '../../src/database/user.service';
import { ScheduleService } from '../../src/schedule/schedule.service';
import { User } from '../../src/user.decorator';

export interface ApiApp {
  app: INestApplication;
  server: ReturnType<INestApplication['getHttpServer']>;
  dataSource: DataSource;
  users: UserDataService;
  leagues: LeagueDataService;
  bets: BetDataService;
  schedule: ScheduleService;
  tokenFor(user: User, expiresIn?: string): string;
  close(): Promise<void>;
}

export interface BootOptions {
  throttle?: boolean;
  importOnBoot?: boolean;
}

export async function bootApiApp(
  databaseUrl: string,
  options: BootOptions = {},
): Promise<ApiApp> {
  env.DATABASE_URL = databaseUrl;
  env.JWT_SECRET = 'api-jwt-secret';
  env.REFRESH_SECRET = 'api-refresh-secret';
  env.COOKIE_SECRET = 'api-cookie-secret';
  env.EMAIL = 'admin@example.invalid';
  env.SKIP_BACKUP = 'true';
  delete env.POSTMARK;
  if (options.importOnBoot) {
    env.IMPORT_ON_BOOT = 'true';
  } else {
    delete env.IMPORT_ON_BOOT;
  }

  // datasource.ts reads DATABASE_URL when app.module.ts first loads it.
  const { AppModule } = await import('../../src/app.module');

  const builder = Test.createTestingModule({ imports: [AppModule] });
  if (!options.throttle) {
    builder.overrideGuard(ThrottlerGuard).useValue({ canActivate: () => true });
  }
  const moduleRef = await builder.compile();

  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();

  const jwt = app.get(JwtService);

  return {
    app,
    server: app.getHttpServer(),
    dataSource: app.get(DataSource),
    users: app.get(UserDataService),
    leagues: app.get(LeagueDataService),
    bets: app.get(BetDataService),
    schedule: app.get(ScheduleService),
    tokenFor: ({ id, name, email }, expiresIn = '15m') =>
      jwt.sign({ id, name, email }, { secret: env.JWT_SECRET, expiresIn }),
    close: () => app.close(),
  };
}
