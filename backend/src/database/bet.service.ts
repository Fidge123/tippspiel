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
    return this.betRepo.find({ where: { user } });
  }

  async findGame(game: string): Promise<BetEntity[]> {
    return this.betRepo.find({ where: { game } });
  }

  async votesPerGame(): Promise<any> {
    return this.betRepo
      .createQueryBuilder('bet')
      .select('game, winner, COUNT(bet.user)')
      .groupBy('game, winner')
      .getRawMany();
  }

  async update(
    { gameID, pointDiff, winner }: CreateBetDto,
    email: string,
  ): Promise<BetEntity> {
    const user = await this.userRepo.findOne({ where: { email } });
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
