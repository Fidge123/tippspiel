import { stringify } from 'querystring';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { ByeEntity } from './bye.entity';
import { GameEntity } from './game.entity';
import { TeamEntity } from './team.entity';
import { WeekEntity } from './week.entity';
import axios from 'axios';
import {
  BASE_URL,
  Scoreboard,
  Team,
  Competitors,
  regularSeason,
  postSeason,
} from './api.type';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(GameEntity)
    private gameRepo: Repository<GameEntity>,
    @InjectRepository(ByeEntity)
    private byeRepo: Repository<ByeEntity>,
    @InjectRepository(TeamEntity)
    private teamRepo: Repository<TeamEntity>,
    @InjectRepository(WeekEntity)
    private weekRepo: Repository<WeekEntity>,
  ) {
    this.init();
  }

  private async init() {
    await this.importTeams();
    await this.importSchedule();
  }

  private async load({ year, seasontype, week }): Promise<Scoreboard> {
    const url = `${BASE_URL}scoreboard?${stringify({
      year,
      seasontype,
      week,
    })}`;
    return (await axios.get(url)).data;
  }

  @Cron(CronExpression.EVERY_WEEK)
  async importTeams() {
    for (let id = 1; id <= 34; id++) {
      const t: Team = (await axios.get(`${BASE_URL}teams/${id}`)).data.team;
      console.log(`Creating ${t.displayName}`);
      const team = (await this.teamRepo.findOne(t.uid)) || new TeamEntity();
      team.id = t.uid;
      team.logo = t.logos[0].href;
      team.abbreviation = t.abbreviation;
      team.shortName = t.shortDisplayName;
      team.name = t.displayName;
      team.wins = findStat(t, 'wins');
      team.losses = findStat(t, 'losses');
      team.ties = findStat(t, 'ties');
      await this.teamRepo.save(team);
    }
  }

  async importWeek(key: { year: number; seasontype: number; week: number }) {
    const response = await this.load(key);
    const calendar =
      response.leagues[0].calendar[key.seasontype - 1].entries[key.week - 1];

    const week = (await this.weekRepo.findOne(key)) || new WeekEntity();
    week.year = key.year;
    week.seasontype = key.seasontype;
    week.week = key.week;
    week.start = new Date(calendar.startDate);
    week.end = new Date(calendar.endDate);
    week.label = calendar.label;
    await this.weekRepo.save(week);

    for (const event of response.events) {
      const competition = event.competitions[0];
      const teams = competition.competitors;
      const home = teams.find((c) => c.homeAway === 'home');
      const away = teams.find((c) => c.homeAway === 'away');

      const game = (await this.gameRepo.findOne(event.uid)) || new GameEntity();
      game.id = event.uid;
      game.date = new Date(event.date);
      game.week = week;
      game.awayTeam = await this.teamRepo.findOne(away.uid);
      game.homeTeam = await this.teamRepo.findOne(home.uid);
      game.awayScore = parseInt(away.score, 10);
      game.homeScore = parseInt(home.score, 10);
      game.winner = getWinner(home, away);
      game.status = competition.status.type.name;
      await this.gameRepo.save(game);
    }

    if (response.week.teamsOnBye) {
      for (const t of response.week.teamsOnBye) {
        const team = await this.teamRepo.findOne(t.uid);
        const bye =
          (await this.byeRepo.findOne({ week, team })) || new ByeEntity();
        bye.week = week;
        bye.team = team;
        await this.byeRepo.save(bye);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async importSchedule() {
    for (let weekNumber = 1; weekNumber <= regularSeason.weeks; weekNumber++) {
      console.log(`Creating Regular Season Week ${weekNumber}`);
      this.importWeek({
        year: regularSeason.year,
        seasontype: regularSeason.seasonType,
        week: weekNumber,
      });
    }
    for (const weekNumber of postSeason.weeks) {
      console.log(`Creating Post Season Week ${weekNumber}`);
      this.importWeek({
        year: postSeason.year,
        seasontype: postSeason.seasonType,
        week: weekNumber,
      });
    }
  }
}

function findStat(t: any, name: string): number {
  try {
    return t.record.items[0].stats.find((s) => s.name === name).value;
  } catch (e) {
    return 0;
  }
}

function getWinner(
  home: Competitors,
  away: Competitors,
): 'home' | 'away' | 'none' {
  if (home.winner) {
    return 'home';
  }
  if (away.winner) {
    return 'away';
  }
  return 'none';
}
