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
} from './entity';

@Injectable()
export class BetDataService {
  constructor(
    @InjectRepository(BetEntity)
    private betRepo: Repository<BetEntity>,
    @InjectRepository(DivisionEntity)
    private divisionRepo: Repository<DivisionEntity>,
    @InjectRepository(DivisionBetEntity)
    private divBetRepo: Repository<DivisionBetEntity>,
    @InjectRepository(GameEntity)
    private gameRepo: Repository<GameEntity>,
    @InjectRepository(TeamEntity)
    private teamRepo: Repository<TeamEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
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

  async findDivisionBets(user: string): Promise<DivisionBetEntity[]> {
    return this.divBetRepo.find({
      where: { user },
      join: {
        alias: 'bet',
        leftJoinAndSelect: { team: 'bet.team', division: 'bet.division' },
      },
    });
  }

  async setDivisionBet(
    { division: div, team: t }: CreateDivisionBetDto,
    userId: string,
  ): Promise<DivisionBetEntity> {
    console.log(div, t, userId);

    const [user, division, team] = await Promise.all([
      this.userRepo.findOneOrFail(userId),
      this.divisionRepo.findOneOrFail({ where: { name: div } }),
      this.teamRepo.findOneOrFail(t),
    ]);

    console.log('Create Tipp', user.name, division.name, team.name);

    const firstGame = await this.gameRepo.findOneOrFail({
      order: { date: 'ASC' },
    });

    console.log(firstGame.date);

    if (new Date() < firstGame.date && user) {
      const divBet =
        (await this.divBetRepo.findOne({ division, user })) ||
        new DivisionBetEntity();
      divBet.user = user;
      divBet.team = team;
      divBet.division = division;
      return this.divBetRepo.save(divBet);
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
