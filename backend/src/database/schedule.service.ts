import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
  ByeEntity,
  WeekEntity,
  GameEntity,
  TeamEntity,
  TeamSeasonEntity,
} from './entity';
import { Competitors, NFLEvent, Team } from './api.type';
import { DivisionEntity } from './entity/division.entity';

@Injectable()
export class ScheduleDataService {
  constructor(
    @InjectRepository(GameEntity)
    private gameRepo: Repository<GameEntity>,
    @InjectRepository(ByeEntity)
    private byeRepo: Repository<ByeEntity>,
    @InjectRepository(DivisionEntity)
    private divisonRepo: Repository<DivisionEntity>,
    @InjectRepository(TeamEntity)
    private teamRepo: Repository<TeamEntity>,
    @InjectRepository(TeamSeasonEntity)
    private teamSeasonRepo: Repository<TeamSeasonEntity>,
    @InjectRepository(WeekEntity)
    private weekRepo: Repository<WeekEntity>,
  ) {}

  async getByes(year: number): Promise<WeekEntity[]> {
    return this.weekRepo
      .createQueryBuilder('week')
      .leftJoinAndSelect('week.byes', 'bye')
      .leftJoin('bye.team', 'team')
      .addSelect(['team.id', 'team.name', 'team.shortName'])
      .where('week.year = :year', { year })
      .orderBy('week.seasontype', 'ASC')
      .addOrderBy('week.week', 'ASC')
      .getMany();
  }

  async getByesForWeek(weekId: string): Promise<WeekEntity> {
    return this.weekRepo
      .createQueryBuilder('week')
      .leftJoinAndSelect('week.byes', 'bye')
      .leftJoin('bye.team', 'team')
      .addSelect(['team.id', 'team.name', 'team.shortName'])
      .where('week.id = :weekId', { weekId })
      .orderBy('week.seasontype', 'ASC')
      .addOrderBy('week.week', 'ASC')
      .getOne();
  }

  async getSchedule(year: number): Promise<WeekEntity[]> {
    return this.weekRepo
      .createQueryBuilder('week')
      .leftJoinAndSelect('week.games', 'game')
      .leftJoin('game.homeTeam', 'home')
      .addSelect(['home.id', 'home.name'])
      .leftJoin('game.awayTeam', 'away')
      .addSelect(['away.id', 'away.name'])
      .where('week.year = :year', { year })
      .orderBy('week.seasontype', 'ASC')
      .addOrderBy('week.week', 'ASC')
      .addOrderBy('game.date', 'ASC')
      .getMany();
  }

  async getWeek(weekId: string): Promise<WeekEntity> {
    return this.weekRepo
      .createQueryBuilder('week')
      .where('week.id = :weekId', { weekId })
      .leftJoinAndSelect('week.games', 'game')
      .leftJoin('game.homeTeam', 'home')
      .addSelect(['home.id', 'home.name'])
      .leftJoin('game.awayTeam', 'away')
      .addSelect(['away.id', 'away.name'])
      .leftJoinAndSelect('bye.team', 'team')
      .addSelect(['team.id', 'team.name'])
      .orderBy('week.seasontype', 'ASC')
      .addOrderBy('week.week', 'ASC')
      .addOrderBy('game.date', 'ASC')
      .getOne();
  }

  async getDivisions(): Promise<DivisionEntity[]> {
    return this.divisonRepo
      .createQueryBuilder('division')
      .leftJoinAndSelect('division.teams', 'team')
      .getMany();
  }

  async getTeams(): Promise<TeamEntity[]> {
    return this.teamRepo.find();
  }

  async getTeam(id: string): Promise<TeamEntity> {
    return this.teamRepo.findOneBy({ id });
  }

  async createOrUpdateDivision(div: any): Promise<DivisionEntity> {
    const division =
      (await this.divisonRepo.findOneBy({ name: div.name })) ||
      new DivisionEntity();
    division.name = div.name;
    return this.divisonRepo.save(division);
  }

  async createOrUpdateTeam(
    team: Team,
    division: DivisionEntity,
    year: number,
  ): Promise<TeamEntity> {
    const state = {
      logo: team.logos[0].href.split('/').reverse()[0],
      abbreviation: team.abbreviation,
      shortName: team.shortDisplayName,
      name: team.displayName,
      playoffSeed: findStat(team, 'playoffSeed'),
      wins: findStat(team, 'wins'),
      losses: findStat(team, 'losses'),
      ties: findStat(team, 'ties'),
      pointsFor: findStat(team, 'pointsFor'),
      pointsAgainst: findStat(team, 'pointsAgainst'),
      streak: findStat(team, 'streak'),
      color1: team.color,
      color2: team.alternateColor,
    };

    const t =
      (await this.teamRepo.findOneBy({ id: team.uid })) || new TeamEntity();
    t.id = team.uid;
    t.division = division;
    Object.assign(t, state);
    const saved = await this.teamRepo.save(t);

    // The per-season row is what scoring reads. The team row above keeps
    // holding the newest values, because the current schedule view still
    // reads them; it is no longer what a finished season is scored against.
    await this.teamSeasonRepo.save({
      teamId: team.uid,
      year,
      divisionName: division.name,
      ...state,
    });

    return saved;
  }

  async createOrUpdateWeek(key: any, calendar: any): Promise<WeekEntity> {
    const week =
      (await this.weekRepo.findOneBy({ ...key })) || new WeekEntity();
    week.id = `${key.year}-${key.seasontype}-${key.week}`;
    week.year = key.year;
    week.seasontype = key.seasontype;
    week.week = key.week;
    week.start = new Date(calendar.startDate);
    week.end = new Date(calendar.endDate);
    week.label = calendar.label;
    return this.weekRepo.save(week);
  }

  async createOrUpdateGame(
    event: NFLEvent,
    week: WeekEntity,
  ): Promise<GameEntity> {
    const competition = event.competitions[0];
    const teams = competition.competitors;
    const home = teams.find((c) => c.homeAway === 'home');
    const away = teams.find((c) => c.homeAway === 'away');

    const game =
      (await this.gameRepo.findOneBy({ id: event.uid })) || new GameEntity();
    game.id = event.uid;
    game.date = new Date(event.date);
    game.week = week;
    game.awayTeam = await this.teamRepo.findOneBy({ id: away.uid });
    game.homeTeam = await this.teamRepo.findOneBy({ id: home.uid });
    game.awayScore = parseInt(away.score, 10);
    game.homeScore = parseInt(home.score, 10);
    game.winner = getWinner(home, away);
    game.status = competition.status.type.name;
    return this.gameRepo.save(game);
  }

  async createOrUpdateBye(t: any, week: any): Promise<ByeEntity> {
    const team = await this.teamRepo.findOneBy({ id: t.uid });
    const bye =
      (await this.byeRepo.findOneBy({ week, team })) || new ByeEntity();
    bye.week = week;
    bye.team = team;
    return this.byeRepo.save(bye);
  }

  async findRecentlyStartedGames(): Promise<GameEntity[]> {
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

    return this.gameRepo.find({
      where: [
        { date: Between(fourHoursAgo, now) },
        { status: 'STATUS_IN_PROGRESS' },
      ],
      relations: ['week'],
    });
  }
}

export function findStat(team: Team, name: string): number {
  try {
    return team.record.items[0].stats.find((s) => s.name === name).value;
  } catch {
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
