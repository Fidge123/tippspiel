import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leaderboard } from './leaderboard.entity';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Leaderboard)
    private LeaderboardRepo: Repository<Leaderboard>,
  ) {}

  async findAll(): Promise<Leaderboard[]> {
    return this.LeaderboardRepo.find();
  }
}
