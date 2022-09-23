import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDivisionBetDto } from '../bet/division.dto';
import { In, MoreThan, Repository } from 'typeorm';

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
import { CreateDoublerDto, DeleteDoublerDto } from 'src/bet/doubler.dto';

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
    return this.userRepo.find({ relations: { memberIn: true } });
  }

  async findGamesWithoutBets(user: string): Promise<GameEntity[]> {
    const now = new Date();
    const thirtyFourHours = 34 * 60 * 60 * 1000;
    const soon = new Date(now.getTime() + thirtyFourHours);
    const status = 'STATUS_SCHEDULED';
    const leagues = await this.leagueRepo.find({
      where: { members: { id: user } },
    });
    const bets = await this.betRepo
      .createQueryBuilder('bets')
      .leftJoin('bets.game', 'game')
      .leftJoin('bets.league', 'league')
      .select(['bets.id', 'game.id', 'league.id'])
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
    return games.filter(
      (game) =>
        !leagues.every((l) =>
          bets
            .filter((bet) => bet.league.id === l.id)
            .some((bet) => bet.game.id === game.id),
        ),
    );
  }

  async divisionBets(
    league: string,
    year: number,
  ): Promise<DivisionBetEntity[]> {
    return this.divBetRepo.find({
      where: { league: { id: league }, year },
      relations: {
        first: true,
        second: true,
        third: true,
        fourth: true,
        division: true,
      },
    });
  }

  async sbBets(league: string, year: number): Promise<SuperbowlBetEntity[]> {
    return this.sbBetRepo.find({
      where: { league: { id: league }, year },
      relations: { team: true },
    });
  }

  async startedGames(league: string, year: number): Promise<GameEntity[]> {
    if (!league || !year) {
      throw new BadRequestException();
    }
    return this.gameRepo.find({
      where: {
        week: { year },
        status: In([
          'STATUS_IN_PROGRESS',
          'STATUS_HALFTIME',
          'STATUS_END_PERIOD',
          'STATUS_FINAL',
        ]),
        bets: { league: { id: league } },
      },
      relations: {
        week: true,
        bets: { user: true, league: true },
      },
    });
  }

  async startedDoublers(
    league: string,
    year: number,
  ): Promise<BetDoublerEntity[]> {
    if (!league || !year) {
      throw new BadRequestException();
    }
    return this.doublerRepo.find({
      where: {
        week: { year },
        game: {
          status: In([
            'STATUS_IN_PROGRESS',
            'STATUS_HALFTIME',
            'STATUS_END_PERIOD',
            'STATUS_FINAL',
          ]),
        },
        league: { id: league },
      },
      relations: {
        game: true,
        user: true,
      },
    });
  }

  async findBets(league: string, year: number): Promise<GameEntity[]> {
    if (!league || !year) {
      throw new BadRequestException();
    }
    return this.gameRepo
      .createQueryBuilder('game')
      .leftJoin('game.week', 'week')
      .andWhere('week.year = :year', { year })
      .leftJoinAndSelect('game.bets', 'bets', 'bets.league = :league', {
        league,
      })
      .leftJoinAndSelect('bets.user', 'user')
      .getMany();
  }

  async findBetsByGame(league: string, year: number): Promise<GameEntity[]> {
    if (!league || !year) {
      throw new BadRequestException();
    }
    return this.gameRepo
      .createQueryBuilder('game')
      .where('game.status = :status', { status: 'STATUS_FINAL' })
      .leftJoin('game.week', 'week')
      .andWhere('week.year = :year', { year })
      .leftJoinAndSelect('game.bets', 'bets', 'bets.league = :league', {
        league,
      })
      .leftJoinAndSelect('bets.user', 'user')
      .getMany();
  }

  async finishedGames(league: string, year: number): Promise<GameEntity[]> {
    if (!league || !year) {
      throw new BadRequestException();
    }
    return this.gameRepo.find({
      where: {
        week: { year },
        status: 'STATUS_FINAL',
        bets: { league: { id: league } },
      },
      relations: {
        week: true,
        bets: { user: true, league: true },
      },
    });
  }

  async finishedDoublers(
    league: string,
    year: number,
  ): Promise<BetDoublerEntity[]> {
    if (!league || !year) {
      throw new BadRequestException();
    }
    return this.doublerRepo.find({
      where: {
        week: { year },
        game: { status: 'STATUS_FINAL' },
        league: { id: league },
      },
      relations: {
        game: true,
        user: true,
      },
    });
  }

  async userDivBets(
    user: string,
    league: string,
    year: number,
  ): Promise<DivisionBetEntity[]> {
    if (!user || !league || !year) {
      throw new BadRequestException();
    }
    return this.divBetRepo.find({
      where: {
        user: { id: user },
        league: { id: league },
        year,
      },
      relations: {
        division: true,
        first: true,
        second: true,
        third: true,
        fourth: true,
      },
    });
  }

  async userSbBets(
    user: string,
    league: string,
    year: number,
  ): Promise<SuperbowlBetEntity> {
    if (!user || !league || !year) {
      throw new BadRequestException();
    }
    return this.sbBetRepo.findOne({
      where: {
        user: { id: user },
        league: { id: league },
        year,
      },
      relations: { team: true },
    });
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
    if (!league || !year) {
      throw new BadRequestException();
    }
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
    if (!league || !year || !user) {
      throw new BadRequestException();
    }
    return this.divBetRepo.find({
      where: { user: { id: user }, year, league: { id: league } },
      relations: {
        first: true,
        second: true,
        third: true,
        fourth: true,
        division: true,
      },
    });
  }

  async findSbBets(
    league: string,
    year: number,
    user: string,
  ): Promise<SuperbowlBetEntity> {
    if (!league || !year || !user) {
      throw new BadRequestException();
    }
    return this.sbBetRepo.findOne({
      where: { user: { id: user }, year, league: { id: league } },
      join: {
        alias: 'bet',
        leftJoinAndSelect: { team: 'bet.team' },
      },
    });
  }

  async findBetDoublers(
    league: string,
    year: number,
    user: string,
  ): Promise<BetDoublerEntity[]> {
    if (!league || !user) {
      throw new BadRequestException();
    }

    return this.doublerRepo.find({
      where: {
        user: { id: user },
        league: { id: league },
        week: { year },
      },
      relations: { game: true, week: true },
    });
  }

  async setDivisionBet(
    {
      division: divisionId,
      teams: teamIds,
      year,
      league: leagueId,
    }: CreateDivisionBetDto,
    userId: string,
  ): Promise<DivisionBetEntity> {
    if (!divisionId || !teamIds || !leagueId || !userId) {
      throw new BadRequestException();
    }

    const [user, division, first, second, third, fourth, league] =
      await Promise.all([
        this.userRepo.findOneOrFail({ where: { id: userId } }),
        this.divisionRepo.findOneOrFail({ where: { name: divisionId } }),
        this.teamRepo.findOneOrFail({ where: { id: teamIds[0] } }),
        this.teamRepo.findOneOrFail({ where: { id: teamIds[1] } }),
        this.teamRepo.findOneOrFail({ where: { id: teamIds[2] } }),
        this.teamRepo.findOneOrFail({ where: { id: teamIds[3] } }),
        this.leagueRepo.findOneOrFail({ where: { id: leagueId } }),
      ]);

    if (
      new Date() < new Date(2022, 8, 11, 19) &&
      user &&
      division &&
      first &&
      second &&
      third &&
      fourth &&
      league
    ) {
      const bet =
        (await this.divBetRepo.findOneBy({ league, division, user })) ||
        new DivisionBetEntity();
      bet.user = user;
      bet.first = first;
      bet.second = second;
      bet.third = third;
      bet.fourth = fourth;
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
    if (!teamId || !leagueId || !year || !userId) {
      throw new BadRequestException();
    }

    const [user, team, league] = await Promise.all([
      this.userRepo.findOneByOrFail({ id: userId }),
      this.teamRepo.findOneByOrFail({ id: teamId }),
      this.leagueRepo.findOneByOrFail({ id: leagueId }),
    ]);

    if (new Date() < new Date(2022, 8, 11, 19) && user) {
      const bet =
        (await this.sbBetRepo.findOneBy({ league, user })) ||
        new SuperbowlBetEntity();
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
    if (!gameId || !leagueId || !weekId || !userId) {
      throw new BadRequestException();
    }

    const [user, game, league, week] = await Promise.all([
      this.userRepo.findOneByOrFail({ id: userId }),
      this.gameRepo.findOneByOrFail({ id: gameId }),
      this.leagueRepo.findOneByOrFail({ id: leagueId }),
      this.weekRepo.findOneByOrFail({ id: weekId }),
    ]);
    const betDoubler = await this.doublerRepo
      .createQueryBuilder('doubler')
      .where('doubler.user = :user', { user: user.id })
      .andWhere('doubler.week = :week', { week: week.id })
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

  async deleteBetDoubler(
    { league: leagueId, week: weekId }: DeleteDoublerDto,
    userId: string,
  ): Promise<void> {
    if (!leagueId || !weekId || !userId) {
      throw new BadRequestException();
    }

    const [user, league, week] = await Promise.all([
      this.userRepo.findOneByOrFail({ id: userId }),
      this.leagueRepo.findOneByOrFail({ id: leagueId }),
      this.weekRepo.findOneByOrFail({ id: weekId }),
    ]);
    const betDoubler = await this.doublerRepo
      .createQueryBuilder('doubler')
      .where('doubler.user = :user', { user: user.id })
      .andWhere('doubler.week = :week', { week: week.id })
      .andWhere('doubler.league = :league', { league: league.id })
      .leftJoinAndSelect('doubler.game', 'game')
      .getOne();

    if (user && betDoubler && new Date() < betDoubler?.game?.date) {
      const bet = betDoubler;
      this.doublerRepo.delete(bet);
      return;
    } else {
      throw new BadRequestException();
    }
  }

  async setGameBet(
    { gameId, pointDiff, winner, leagueId }: CreateBetDto,
    userId: string,
  ): Promise<BetEntity> {
    if (!gameId || !leagueId || !userId || pointDiff < 1 || pointDiff > 5) {
      throw new BadRequestException();
    }
    const [user, game, league] = await Promise.all([
      this.userRepo.findOneBy({ id: userId }),
      this.gameRepo.findOneBy({ id: gameId }),
      this.leagueRepo.findOneBy({ id: leagueId }),
    ]);

    console.log(`User ${user.name} posted bet for ${game.id}`);

    if (new Date() < new Date(game.date) && user && game.id === gameId) {
      const bet =
        (await this.betRepo.findOneBy({ league, user, game })) ||
        new BetEntity();
      bet.user = user;
      bet.game = game;
      bet.league = league;
      bet.pointDiff = pointDiff;
      bet.winner = winner;
      return this.betRepo.save(bet);
    }
  }
}
