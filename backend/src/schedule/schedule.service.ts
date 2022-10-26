import { stringify } from 'node:querystring';
import { env } from 'node:process';
import { resolve } from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import { promisify } from 'node:util';
import { gzip as gzipCompress } from 'node:zlib';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduleDataService } from '../database/schedule.service';
import { Scoreboard, Team } from '../database/api.type';
import { getTransporter } from '../email';
import { loadHTML, loadTXT } from '../templates/loadTemplate';

const gzip = promisify(gzipCompress);

export const BASE_URL =
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/';

export const regularSeason = {
  year: 2022,
  seasonType: 2,
  weeks: 18,
};
export const postSeason = {
  year: 2022,
  seasonType: 3,
  weeks: [1, 2, 3, 5],
};

async function notify(url: string) {
  const transporter = await getTransporter();
  await transporter
    .sendEmail({
      From: 'Tippspiel <tippspiel@6v4.de>',
      To: env.EMAIL,
      Subject: `API Request failed`,
      TextBody: await loadTXT('requestFailed', { url }),
      HtmlBody: await loadHTML('requestFailed', { url }),
    })
    .catch((error) => console.error(error));
}

@Injectable()
export class ScheduleService {
  constructor(private readonly databaseService: ScheduleDataService) {
    this.init();
  }

  private async init(): Promise<void> {
    await this.importMasterData();
    await this.importSchedule();
  }

  @Cron('3 7 * Aug-Dec,Jan,Feb *')
  async importMasterData(): Promise<void> {
    const response = await fetch(`${BASE_URL}groups`);
    if (!response.ok) {
      console.error('Error loading divisions!');
      await notify(`${BASE_URL}groups`);
      return;
    }
    const data = await response.json();

    await recordToFile('groups', data);

    for (const conf of data.groups) {
      console.log(`--- Loading ${conf.abbreviation} divisions ---`);
      await Promise.all(
        conf.children.map((division: any) =>
          this.importTeamsOfDivision(division),
        ),
      );
    }
  }

  async importTeamsOfDivision(division: any): Promise<void> {
    const divEntity = await this.databaseService.createOrUpdateDivision({
      name: division.name,
    });
    try {
      const teamResponses = await Promise.all(
        division.teams.map(async (team: Team) =>
          fetch(`${BASE_URL}teams/${team.id}`).then(async (r) => r.json()),
        ),
      );

      await recordToFile(`teams-${division.name}`, teamResponses);

      for (const t of teamResponses.map((t) => t.team)) {
        console.log(`Creating ${t.displayName}`);
        await this.databaseService.createOrUpdateTeam(t, divEntity);
      }
    } catch (e: unknown) {
      await notify(`${BASE_URL}teams/<team.id>`);
      console.error('Error during import of divisions', (e as Error)?.stack);
    }
  }

  async importWeek(key: {
    year: number;
    seasontype: number;
    week: number;
  }): Promise<void> {
    console.log(
      `Loading ${key.year} ${
        key.seasontype === 2 ? 'regular season' : 'postseason'
      } week ${key.week} ...`,
    );
    const response = await load(key);

    await recordToFile(
      `scoreboard-${key.year}-${key.seasontype}-${key.week}`,
      response,
    );

    const calendar =
      response.leagues[0].calendar[key.seasontype - 1].entries[key.week - 1];

    const week = await this.databaseService.createOrUpdateWeek(key, calendar);

    await Promise.all(
      response.events.map((event) =>
        this.databaseService.createOrUpdateGame(event, week),
      ),
    );

    if (response.week.teamsOnBye) {
      await Promise.all(
        response.week.teamsOnBye.map((t) =>
          this.databaseService.createOrUpdateBye(t, week),
        ),
      );
    }
  }

  @Cron('48 7 * Aug-Dec,Jan,Feb *')
  async importSchedule(): Promise<void> {
    for (let weekNumber = 1; weekNumber <= regularSeason.weeks; weekNumber++) {
      this.importWeek({
        year: regularSeason.year,
        seasontype: regularSeason.seasonType,
        week: weekNumber,
      });
    }
    for (const weekNumber of postSeason.weeks) {
      this.importWeek({
        year: postSeason.year,
        seasontype: postSeason.seasonType,
        week: weekNumber,
      });
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateGames(): Promise<void> {
    const games = await this.databaseService.findRecentlyStartedGames();
    // console.log(`${games.length} games started within the last 4 hours`);

    if (games.length) {
      await Promise.all(
        games.map((game) =>
          this.importWeek({
            year: game.week.year,
            seasontype: game.week.seasontype,
            week: game.week.week,
          }),
        ),
      );
    }
  }
}

async function load({ year, seasontype, week }): Promise<Scoreboard> {
  const q = stringify({
    dates: year,
    seasontype,
    week,
  });
  const response = await fetch(`${BASE_URL}scoreboard?${q}`);
  if (!response.ok) {
    console.error('Failed to load scoreboard!');
    await notify(`${BASE_URL}scoreboard?${q}`);
    return;
  }
  return await response.json();
}

async function recordToFile(name: string, data: any) {
  const today = new Date();
  if (today.getDay() === 0 && !env.SKIP_BACKUP) {
    const path = '~/backup';
    await mkdir(path, { recursive: true });
    await writeFile(
      resolve(path, `${name}-${today.toISOString()}.json.gz`),
      await gzip(JSON.stringify(data)),
      { encoding: 'utf8' },
    );
  }
}
