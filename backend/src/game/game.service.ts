import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private sbRepo: Repository<Game>,
  ) {}

  async findAll(season: number): Promise<Game[]> {
    return this.sbRepo.find({ where: { season } });
  }
}
