import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBetDto } from '../bet/bet.dto';
import { BetEntity, UserEntity, GameEntity } from './entity';

@Injectable()
export class BetDataService {
  constructor(
    @InjectRepository(BetEntity)
    private betRepo: Repository<BetEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(GameEntity)
    private gameRepo: Repository<GameEntity>,
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

  async update(
    { gameID, pointDiff, winner }: CreateBetDto,
    userId: string,
  ): Promise<BetEntity> {
    const user = await this.userRepo.findOne(userId);
    const game = await this.gameRepo.findOne(gameID);
    if (new Date() < new Date(game.date)) {
      const tipp = this.betRepo.create({
        user,
        game,
        pointDiff,
        winner,
      });
      return this.betRepo.save(tipp);
    }
  }

  async remove(id: string): Promise<void> {
    await this.betRepo.delete(id);
  }
}
