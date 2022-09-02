import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDivisionBetDto } from '../bet/division.dto';
import { MoreThan, Repository } from 'typeorm';

import { CreateBetDto } from '../bet/bet.dto';

import {
  BetEntity,
  DivisionEntity,
  DivisionBetEntity,
  GameEntity,
  TeamEntity,
  UserEntity,
  SuperbowlBetEntity,
  BetDoublerEntity,
  WeekEntity,
  LeagueEntity,
} from './entity';
import { CreateSBBetDto } from 'src/bet/superbowl.dto';
import { CreateDoublerDto } from 'src/bet/doubler.dto';

@Injectable()
export class BetDataService {
  constructor(
    @InjectRepository(BetEntity)
    private betRepo: Repository<BetEntity>,
    @InjectRepository(BetDoublerEntity)
    private doublerRepo: Repository<BetDoublerEntity>,
    @InjectRepository(DivisionEntity)
    private divisionRepo: Repository<DivisionEntity>,
    @InjectRepository(DivisionBetEntity)
    private divBetRepo: Repository<DivisionBetEntity>,
    @InjectRepository(SuperbowlBetEntity)
    private sbBetRepo: Repository<SuperbowlBetEntity>,
    @InjectRepository(GameEntity)
    private gameRepo: Repository<GameEntity>,
    @InjectRepository(TeamEntity)
    private teamRepo: Repository<TeamEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(WeekEntity)
    private weekRepo: Repository<WeekEntity>,
    @InjectRepository(LeagueEntity)
    private leagueRepo: Repository<LeagueEntity>,
  ) {}

  async findAllUsers(): Promise<UserEntity[]> {
    return this.userRepo.find();
  }

  async findGamesWithoutBets(user: string): Promise<GameEntity[]> {
    //TODO leagues

    const now = new Date();
    const thirtyFourHours = 34 * 60 * 60 * 1000;
    const soon = new Date(now.getTime() + thirtyFourHours);
    const status = 'STATUS_SCHEDULED';
    const bets = await this.betRepo
      .createQueryBuilder('bets')
      .leftJoin('bets.game', 'game')
      .select(['bets.id', 'game.id'])
      .where('bets.user = :user')
      .andWhere('game.date > :now')
      .andWhere('game.date <= :soon')
      .setParameters({ now, soon, status, user })
      .getMany();
    const games = await this.gameRepo
      .createQueryBuilder('game')
      .leftJoin('game.homeTeam', 'home')
      .leftJoin('game.awayTeam', 'away')
      .select(['game.id', 'game.date', 'home.name', 'away.name'])
      .where('game.date > :now')
      .andWhere('game.status = :status')
      .andWhere('game.date <= :soon')
      .setParameters({ now, soon, status })
      .getMany();
    return games.filter((game) => !bets.some((bet) => bet.game.id === game.id));
  }

  async findBetsForStartedGames(
    league: string,
    year: number,
  ): Promise<GameEntity[]> {
    return this.gameRepo
      .createQueryBuilder('game')
      .where('game.date < :now', { now: new Date() })
      .leftJoin('game.week', 'week')
      .andWhere('week.year = :year', { year })
      .leftJoinAndSelect('game.bets', 'bets')
      .andWhere('bets.league = :league', { league })
      .leftJoinAndSelect('bets.user', 'user')
      .getMany();
  }

  async findBets(league: string, year: number): Promise<GameEntity[]> {
    return this.gameRepo
      .createQueryBuilder('game')
      .leftJoin('game.week', 'week')
      .andWhere('week.year = :year', { year })
      .leftJoinAndSelect('game.bets', 'bets')
      .andWhere('bets.league = :league', { league })
      .leftJoinAndSelect('bets.user', 'user')
      .getMany();
  }

  async findBetsByGame(league: string, year: number): Promise<GameEntity[]> {
    return this.gameRepo
      .createQueryBuilder('game')
      .where('game.status = :status', { status: 'STATUS_FINAL' })
      .leftJoin('game.week', 'week')
      .andWhere('week.year = :year', { year })
      .leftJoinAndSelect('game.bets', 'bets')
      .andWhere('bets.league = :league', { league })
      .leftJoinAndSelect('bets.user', 'user')
      .getMany();
  }

  async findBetsByUser(league: string, year: number): Promise<UserEntity[]> {
    return this.userRepo
      .createQueryBuilder('user')
      .andWhere('user.memberIn = :league', { league })
      .leftJoinAndSelect('user.bets', 'bets')
      .leftJoinAndSelect('user.divisionBets', 'divisionBets')
      .leftJoinAndSelect('divisionBets.team', 'divTeam')
      .leftJoinAndSelect('divisionBets.division', 'division')
      .leftJoinAndSelect('user.superbowlBets', 'superbowlBets')
      .leftJoinAndSelect('superbowlBets.team', 'sbTeam')
      .andWhere('bets.league = :league', { league })
      .leftJoinAndSelect('bets.game', 'game')
      .where('game.status = :status', { status: 'STATUS_FINAL' })
      .leftJoin('game.week', 'week')
      .andWhere('week.year = :year', { year })
      .andWhere('divisionBets.year = :year', { year })
      .andWhere('superbowlBets.year = :year', { year })
      .getMany();
  }

  async findCurrentWeek(): Promise<WeekEntity> {
    return (
      (await this.weekRepo.findOne({
        where: { end: MoreThan(new Date()) },
        order: { end: 'ASC' },
      })) || (await this.weekRepo.findOne({ order: { end: 'DESC' } }))
    );
  }

  async findSbWinner(year: number): Promise<TeamEntity> {
    const game = await this.gameRepo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.week', 'week')
      .leftJoinAndSelect('game.homeTeam', 'home')
      .leftJoinAndSelect('game.awayTeam', 'away')
      .where('week.seasonType = :st', { st: 3 })
      .andWhere('week.week = :w', { w: 5 })
      .andWhere('week.year = :year', { year })
      .getOne();

    return game.winner === 'home' ? game.homeTeam : game.awayTeam;
  }

  async votesPerGame(league: string, year: number): Promise<GameEntity[]> {
    return this.gameRepo
      .createQueryBuilder('game')
      .leftJoin('game.week', 'week')
      .andWhere('week.year = :year', { year })
      .leftJoinAndSelect('game.bets', 'bets')
      .andWhere('bets.league = :league', { league })
      .getMany();
  }

  async findDivisionBets(
    league: string,
    year: number,
    user: string,
  ): Promise<DivisionBetEntity[]> {
    return this.divBetRepo.find({
      where: { user: { id: user }, year, league: { id: league } },
      join: {
        alias: 'bet',
        leftJoinAndSelect: { team: 'bet.team', division: 'bet.division' },
      },
    });
  }

  async findSbBets(
    league: string,
    year: number,
    user: string,
  ): Promise<SuperbowlBetEntity> {
    return this.sbBetRepo.findOne({
      where: { user: { id: user }, year, league: { id: league } },
      join: {
        alias: 'bet',
        leftJoinAndSelect: { team: 'bet.team' },
      },
    });
  }

  async findBetDoublersForStartedGames(
    league: string,
    year: number,
  ): Promise<BetDoublerEntity[]> {
    return this.doublerRepo
      .createQueryBuilder('doubler')
      .leftJoinAndSelect('doubler.game', 'game')
      .where('game.date < :now', { now: new Date() })
      .leftJoin('doubler.week', 'week')
      .andWhere('week.year = :year', { year })
      .andWhere('bets.league = :league', { league })
      .leftJoinAndSelect('doubler.user', 'user')
      .getMany();
  }

  async findBetDoublers(
    league: string,
    year: number,
    user: string,
  ): Promise<BetDoublerEntity[]> {
    return this.doublerRepo.find({
      where: { user: { id: user }, league: { id: league }, week: { year } },
      join: {
        alias: 'bet',
        leftJoinAndSelect: { game: 'bet.game', week: 'bet.week' },
      },
    });
  }

  async setDivisionBet(
    { division: div, team: t, year, league: l }: CreateDivisionBetDto,
    userId: string,
  ): Promise<DivisionBetEntity> {
    // TODO new scoring
    const [user, division, team, league] = await Promise.all([
      this.userRepo.findOneByOrFail({ id: userId }),
      this.divisionRepo.findOneByOrFail({ name: div }),
      this.teamRepo.findOneByOrFail({ id: t }),
      this.leagueRepo.findOneByOrFail({ id: l }),
    ]);

    if (
      new Date() < new Date(2022, 8, 11, 19) &&
      user &&
      division &&
      team &&
      league
    ) {
      const bet =
        (await this.divBetRepo.findOneBy({ division, user })) ||
        new DivisionBetEntity();
      bet.user = user;
      bet.team = team;
      bet.year = year;
      bet.league = league;
      bet.division = division;
      return this.divBetRepo.save(bet);
    }
  }

  async setSbBet(
    { teamId, year, leagueId }: CreateSBBetDto,
    userId: string,
  ): Promise<SuperbowlBetEntity> {
    const [user, team, league] = await Promise.all([
      this.userRepo.findOneByOrFail({ id: userId }),
      this.teamRepo.findOneByOrFail({ id: teamId }),
      this.leagueRepo.findOneByOrFail({ id: leagueId }),
    ]);

    if (new Date() < new Date(2022, 8, 11, 19) && user) {
      const bet =
        (await this.sbBetRepo.findOneBy({ user })) || new SuperbowlBetEntity();
      bet.user = user;
      bet.year = year;
      bet.team = team;
      bet.league = league;
      return this.sbBetRepo.save(bet);
    }
  }

  async setBetDoubler(
    { game: gameId, league: leagueId, week: weekId }: CreateDoublerDto,
    userId: string,
  ): Promise<BetDoublerEntity> {
    const [y, st, w] = weekId.split('-').map((n) => parseInt(n, 10));

    const [user, game, league, week] = await Promise.all([
      this.userRepo.findOneByOrFail({ id: userId }),
      this.gameRepo.findOneByOrFail({ id: gameId }),
      this.leagueRepo.findOneByOrFail({ id: leagueId }),
      this.weekRepo.findOneByOrFail({ year: y, seasontype: st, week: w }),
    ]);
    const betDoubler = await this.doublerRepo
      .createQueryBuilder('doubler')
      .where('doubler.user = :user', { user: user.id })
      .andWhere('doubler.weekYear = :year', { year: week.year })
      .andWhere('doubler.weekSeasontype = :st', { st: week.seasontype })
      .andWhere('doubler.weekWeek = :week', { week: week.week })
      .andWhere('doubler.league = :league', { league: league.id })
      .leftJoinAndSelect('doubler.game', 'game')
      .getOne();

    if (
      new Date() < game.date &&
      user &&
      (!betDoubler || new Date() < betDoubler?.game?.date)
    ) {
      const bet = betDoubler || new BetDoublerEntity();
      bet.user = user;
      bet.game = game;
      bet.league = league;
      bet.week = week;
      return this.doublerRepo.save(bet);
    } else {
      throw new BadRequestException();
    }
  }

  async update(
    { gameId, pointDiff, winner, leagueId }: CreateBetDto,
    userId: string,
  ): Promise<BetEntity> {
    const [user, game, league] = await Promise.all([
      this.userRepo.findOneBy({ id: userId }),
      this.gameRepo.findOneBy({ id: gameId }),
      this.leagueRepo.findOneBy({ id: leagueId }),
    ]);

    console.log(`User ${user.name} posted bet for ${game.id}`);

    if (new Date() < new Date(game.date) && user && game.id === gameId) {
      const bet =
        (await this.betRepo.findOneBy({ user, game })) || new BetEntity();
      bet.user = user;
      bet.game = game;
      bet.league = league;
      bet.pointDiff = pointDiff;
      bet.winner = winner;
      return this.betRepo.save(bet);
    }
  }
}
