import { stringify } from 'querystring';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { ScheduleDataService } from '../database/schedule.service';
import { Scoreboard, Team } from '../database/api.type';

export const BASE_URL =
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/';

export const regularSeason = {
  year: 2021,
  seasonType: 2,
  weeks: 18,
};
export const postSeason = {
  year: 2021,
  seasonType: 3,
  weeks: [1, 2, 3, 5],
};

@Injectable()
export class ScheduleService {
  constructor(private readonly databaseService: ScheduleDataService) {
    this.init();
  }

  private async init(): Promise<void> {
    // await this.importTeams();
    // await this.importSchedule();
  }

  @Cron('0 0 * * TUE')
  async importTeams(): Promise<void> {
    const promises = [];
    for (let id = 1; id <= 34; id++) {
      promises.push(axios.get(`${BASE_URL}teams/${id}`));
    }
    const teams: Team[] = (await Promise.all(promises)).map(
      (team) => team.data.team,
    );
    for (const t of teams) {
      console.log(`Creating ${t.displayName}`);
      await this.databaseService.createOrUpdateTeam(t);
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
    console.log(`${games.length} games started within the last 4 hours`);

    if (games.length) {
      return await this.importWeek({
        year: games[0].week.year,
        seasontype: games[0].week.seasontype,
        week: games[0].week.week,
      });
    }
  }
}

async function load({ year, seasontype, week }): Promise<Scoreboard> {
  const q = stringify({
    year,
    seasontype,
    week,
  });
  return (await axios.get(`${BASE_URL}scoreboard?${q}`)).data;
}
