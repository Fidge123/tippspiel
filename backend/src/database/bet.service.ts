import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDivisionBetDto } from 'src/bet/division.dto';
import { Brackets, Repository } from 'typeorm';

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
} from './entity';

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
  ) {}

  async findAll(): Promise<BetEntity[]> {
    return this.betRepo.find();
  }

  async findUser(user: string): Promise<BetEntity[]> {
    return this.betRepo
      .createQueryBuilder('bets')
      .leftJoin('bets.user', 'user')
      .where('user.email = :email', { email: user })
      .getMany();
  }

  async findGame(game: string): Promise<BetEntity[]> {
    return this.betRepo.find({ where: { game } });
  }

  async findAllUsers(): Promise<UserEntity[]> {
    return this.userRepo.find();
  }

  async findGamesWithoutBets(user: string): Promise<GameEntity[]> {
    const now = new Date();
    const thirtyHours = 30 * 60 * 60 * 1000;
    const soon = new Date(now.getTime() + thirtyHours);
    const status = 'STATUS_SCHEDULED';
    const bets = this.betRepo
      .createQueryBuilder('bet')
      .select('bet.id')
      .where('bet.user = :user');
    return this.gameRepo
      .createQueryBuilder('game')
      .leftJoin('game.homeTeam', 'home')
      .leftJoin('game.awayTeam', 'away')
      .leftJoin('game.bets', 'bets')
      .select(['game.date', 'home.name', 'away.name'])
      .where('game.date > :now')
      .andWhere('game.status = :status')
      .andWhere('game.date <= :soon')
      .andWhere(
        new Brackets((qb) =>
          qb
            .where(`bets.id NOT IN (${bets.getQuery()})`)
            .orWhere('bets.id IS NULL'),
        ),
      )
      .setParameters({ now, soon, status, user })
      .getMany();
  }

  async findBetsForStartedGames(year: number): Promise<GameEntity[]> {
    return (
      this.gameRepo
        .createQueryBuilder('game')
        .where('game.date < :now', { now: new Date() })
        .leftJoin('game.week', 'week')
        .andWhere('week.year = :year', { year })
        .leftJoinAndSelect('game.bets', 'bets')
        // .andWhere('bets.league = :league', { league: '' })
        .leftJoinAndSelect('bets.user', 'user')
        .getMany()
    );
  }

  async findBets(year: number): Promise<GameEntity[]> {
    return (
      this.gameRepo
        .createQueryBuilder('game')
        .leftJoin('game.week', 'week')
        .andWhere('week.year = :year', { year })
        .leftJoinAndSelect('game.bets', 'bets')
        // .andWhere('bets.league = :league', { league: '' })
        .leftJoinAndSelect('bets.user', 'user')
        .getMany()
    );
  }

  async findBetsByGame(year: number): Promise<GameEntity[]> {
    return (
      this.gameRepo
        .createQueryBuilder('game')
        .where('game.status = :status', { status: 'STATUS_FINAL' })
        .leftJoin('game.week', 'week')
        .andWhere('week.year = :year', { year })
        .leftJoinAndSelect('game.bets', 'bets')
        // .andWhere('bets.league = :league', { league: '' })
        .leftJoinAndSelect('bets.user', 'user')
        .getMany()
    );
  }

  async findBetsByUser(year: number): Promise<GameEntity[]> {
    return (
      this.gameRepo
        .createQueryBuilder('user')
        // .andWhere('user.memberIn = :league', { league: '' })
        .leftJoinAndSelect('user.bets', 'bets')
        // .andWhere('bets.league = :league', { league: '' })
        .leftJoinAndSelect('bets.game', 'game')
        .where('game.status = :status', { status: 'STATUS_FINAL' })
        .leftJoin('game.week', 'week')
        .andWhere('week.year = :year', { year })
        .getMany()
    );
  }

  async votesPerGame(year: number): Promise<GameEntity[]> {
    return (
      this.gameRepo
        .createQueryBuilder('game')
        .leftJoin('game.week', 'week')
        .andWhere('week.year = :year', { year })
        .leftJoinAndSelect('game.bets', 'bets')
        // .andWhere('bets.league = :league', { league: '' })
        .getMany()
    );
  }

  async findDivisionBets(
    year: number,
    user: string,
  ): Promise<DivisionBetEntity[]> {
    return this.divBetRepo.find({
      where: { user, year },
      join: {
        alias: 'bet',
        leftJoinAndSelect: { team: 'bet.team', division: 'bet.division' },
      },
    });
  }

  async findSbBets(year: number, user: string): Promise<SuperbowlBetEntity> {
    return this.sbBetRepo.findOne({
      where: { user, year },
      join: {
        alias: 'bet',
        leftJoinAndSelect: { team: 'bet.team' },
      },
    });
  }

  async findBetDoublers(
    year: number,
    user: string,
  ): Promise<BetDoublerEntity[]> {
    return this.doublerRepo.find({
      where: { user },
      join: {
        alias: 'bet',
        leftJoinAndSelect: { game: 'bet.game', week: 'bet.week' },
      },
    });
  }

  async setDivisionBet(
    { division: div, team: t, year }: CreateDivisionBetDto,
    userId: string,
  ): Promise<DivisionBetEntity> {
    const [user, division, team] = await Promise.all([
      this.userRepo.findOneOrFail(userId),
      this.divisionRepo.findOneOrFail({ where: { name: div } }),
      this.teamRepo.findOneOrFail(t),
    ]);

    if (new Date() < new Date(2021, 8, 19, 19) && user) {
      const bet =
        (await this.divBetRepo.findOne({ division, user })) ||
        new DivisionBetEntity();
      bet.user = user;
      bet.team = team;
      bet.year = year;
      bet.division = division;
      return this.divBetRepo.save(bet);
    }
  }

  async setSbBet(
    teamId: string,
    year: number,
    userId: string,
  ): Promise<SuperbowlBetEntity> {
    const [user, team] = await Promise.all([
      this.userRepo.findOneOrFail(userId),
      this.teamRepo.findOneOrFail(teamId),
    ]);

    if (new Date() < new Date(2021, 8, 19, 19) && user) {
      const bet =
        (await this.sbBetRepo.findOne({ user })) || new SuperbowlBetEntity();
      bet.user = user;
      bet.year = year;
      bet.team = team;
      return this.sbBetRepo.save(bet);
    }
  }

  async setBetDoubler(
    gameId: string,
    weekId: { week: number; seasontype: number; year: number },
    userId: string,
  ): Promise<BetDoublerEntity> {
    const [user, game, week] = await Promise.all([
      this.userRepo.findOneOrFail(userId),
      this.gameRepo.findOneOrFail(gameId),
      this.weekRepo.findOneOrFail(weekId),
    ]);

    if (new Date() < game.date && user) {
      const bet =
        (await this.doublerRepo.findOne({ user, week })) ||
        new BetDoublerEntity();
      bet.user = user;
      bet.game = game;
      bet.week = week;
      return this.doublerRepo.save(bet);
    }
  }

  async update(
    { gameID, pointDiff, winner }: CreateBetDto,
    userId: string,
  ): Promise<BetEntity> {
    const user = await this.userRepo.findOne(userId);
    const game = await this.gameRepo.findOne(gameID);

    if (new Date() < new Date(game.date) && user && game.id === gameID) {
      const bet =
        (await this.betRepo.findOne({ user, game })) || new BetEntity();
      bet.user = user;
      bet.game = game;
      bet.pointDiff = pointDiff;
      bet.winner = winner;
      return this.betRepo.save(bet);
    }
  }

  async remove(id: string): Promise<void> {
    await this.betRepo.delete(id);
  }
}
