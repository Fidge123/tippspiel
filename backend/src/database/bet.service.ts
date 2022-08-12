import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDivisionBetDto } from 'src/bet/division.dto';
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
    return this.betRepo.find({ where: { game: { id: game } } });
  }

  async findAllUsers(): Promise<UserEntity[]> {
    return this.userRepo.find();
  }

  async findGamesWithoutBets(user: string): Promise<GameEntity[]> {
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

  async findBetsByUser(year: number): Promise<UserEntity[]> {
    return (
      this.userRepo
        .createQueryBuilder('user')
        // .andWhere('user.memberIn = :league', { league: '' })
        .leftJoinAndSelect('user.bets', 'bets')
        .leftJoinAndSelect('user.divisionBets', 'divisionBets')
        .leftJoinAndSelect('divisionBets.team', 'divTeam')
        .leftJoinAndSelect('divisionBets.division', 'division')
        .leftJoinAndSelect('user.superbowlBets', 'superbowlBets')
        .leftJoinAndSelect('superbowlBets.team', 'sbTeam')
        // .andWhere('bets.league = :league', { league: '' })
        .leftJoinAndSelect('bets.game', 'game')
        .where('game.status = :status', { status: 'STATUS_FINAL' })
        .leftJoin('game.week', 'week')
        .andWhere('week.year = :year', { year })
        .andWhere('divisionBets.year = :year', { year })
        .andWhere('superbowlBets.year = :year', { year })
        .getMany()
    );
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
      where: { user: { id: user }, year },
      join: {
        alias: 'bet',
        leftJoinAndSelect: { team: 'bet.team', division: 'bet.division' },
      },
    });
  }

  async findSbBets(year: number, user: string): Promise<SuperbowlBetEntity> {
    return this.sbBetRepo.findOne({
      where: { user: { id: user }, year },
      join: {
        alias: 'bet',
        leftJoinAndSelect: { team: 'bet.team' },
      },
    });
  }

  async findBetDoublersForStartedGames(
    year: number,
  ): Promise<BetDoublerEntity[]> {
    return (
      this.doublerRepo
        .createQueryBuilder('doubler')
        .leftJoinAndSelect('doubler.game', 'game')
        .where('game.date < :now', { now: new Date() })
        .leftJoin('doubler.week', 'week')
        .andWhere('week.year = :year', { year })
        // .andWhere('bets.league = :league', { league: '' })
        .leftJoinAndSelect('doubler.user', 'user')
        .getMany()
    );
  }

  async findBetDoublers(
    year: number,
    user: string,
  ): Promise<BetDoublerEntity[]> {
    return this.doublerRepo.find({
      where: { user: { id: user } },
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
      this.userRepo.findOneByOrFail({ id: userId }),
      this.divisionRepo.findOneByOrFail({ name: div }),
      this.teamRepo.findOneByOrFail({ id: t }),
    ]);

    if (new Date() < new Date(2022, 8, 11, 19) && user) {
      const bet =
        (await this.divBetRepo.findOneBy({ division, user })) ||
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
      this.userRepo.findOneByOrFail({ id: userId }),
      this.teamRepo.findOneByOrFail({ id: teamId }),
    ]);

    if (new Date() < new Date(2022, 8, 11, 19) && user) {
      const bet =
        (await this.sbBetRepo.findOneBy({ user })) || new SuperbowlBetEntity();
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
      this.userRepo.findOneByOrFail({ id: userId }),
      this.gameRepo.findOneByOrFail({ id: gameId }),
      this.weekRepo.findOneByOrFail({ ...weekId }),
    ]);
    const betDoubler = await this.doublerRepo
      .createQueryBuilder('doubler')
      .where('doubler.user = :user', { user: user.id })
      .andWhere('doubler.weekYear = :year', { year: week.year })
      .andWhere('doubler.weekSeasontype = :st', { st: week.seasontype })
      .andWhere('doubler.weekWeek = :week', { week: week.week })
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
      bet.week = week;
      return this.doublerRepo.save(bet);
    } else {
      throw new BadRequestException();
    }
  }

  async update(
    { gameId, pointDiff, winner }: CreateBetDto,
    userId: string,
  ): Promise<BetEntity> {
    const user = await this.userRepo.findOneBy({ id: userId });
    const game = await this.gameRepo.findOneBy({ id: gameId });

    console.log(`User ${user.name} posted bet for ${game.id}`);

    if (new Date() < new Date(game.date) && user && game.id === gameId) {
      const bet =
        (await this.betRepo.findOneBy({ user, game })) || new BetEntity();
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
