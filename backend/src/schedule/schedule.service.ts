import { stringify } from 'querystring';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Between, Repository } from 'typeorm';
import { ByeEntity, WeekEntity, GameEntity, TeamEntity } from './entity';
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

  private async init(): Promise<void> {
    await this.importTeams();
    await this.importSchedule();
  }

  async getSchedule(year: number): Promise<WeekEntity[]> {
    return this.weekRepo
      .createQueryBuilder('week')
      .leftJoin('week.byes', 'bye')
      .leftJoinAndSelect('week.games', 'game')
      .leftJoin('game.homeTeam', 'home')
      .addSelect(['home.id', 'home.name'])
      .leftJoin('game.awayTeam', 'away')
      .addSelect(['away.id', 'away.name'])
      .leftJoinAndSelect('bye.team', 'team')
      .addSelect(['team.id', 'team.name'])
      .where('week.year = :year', { year })
      .orderBy('week.seasontype', 'ASC')
      .addOrderBy('week.week', 'ASC')
      .getMany();
  }

  async getWeek(
    year: number,
    seasontype: number,
    week: number,
  ): Promise<WeekEntity[]> {
    return this.weekRepo
      .createQueryBuilder('week')
      .where('week.year = :year', { year })
      .andWhere('week.seasontype = :seasontype', { seasontype })
      .andWhere('week.week = :week', { week })
      .leftJoin('week.byes', 'bye')
      .leftJoinAndSelect('week.games', 'game')
      .leftJoin('game.homeTeam', 'home')
      .addSelect(['home.id', 'home.name'])
      .leftJoin('game.awayTeam', 'away')
      .addSelect(['away.id', 'away.name'])
      .leftJoinAndSelect('bye.team', 'team')
      .addSelect(['team.id', 'team.name'])
      .orderBy('week.seasontype', 'ASC')
      .addOrderBy('week.week', 'ASC')
      .getMany();
  }

  async getTeams(): Promise<TeamEntity[]> {
    return this.teamRepo.find();
  }

  async getTeam(id: string): Promise<TeamEntity> {
    return this.teamRepo.findOne(id);
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
      const team = (await this.teamRepo.findOne(t.uid)) || new TeamEntity();
      team.id = t.uid;
      team.logo = t.logos[0].href.split('/').reverse()[0];
      team.abbreviation = t.abbreviation;
      team.shortName = t.shortDisplayName;
      team.name = t.displayName;
      team.color1 = t.color;
      team.color2 = t.alternateColor;
      team.wins = findStat(t, 'wins');
      team.losses = findStat(t, 'losses');
      team.ties = findStat(t, 'ties');
      await this.teamRepo.save(team);
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
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

    console.log('Checking for running games...');
    const games = await this.gameRepo.find({
      where: { date: Between(fourHoursAgo, now) },
    });
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
