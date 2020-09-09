import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tipp } from './tipp.entity';
import { CreateTippDto } from './tipp.dto';

@Injectable()
export class TippService {
  constructor(
    @InjectRepository(Tipp)
    private sbRepo: Repository<Tipp>,
  ) {}

  findAll(): Promise<Tipp[]> {
    return this.sbRepo.find();
  }

  findOne(user: string, game: string): Promise<Tipp> {
    return this.sbRepo.findOne({ game, user });
  }

  async update({
    game,
    pointDiff,
    user,
    winner,
  }: CreateTippDto): Promise<Tipp> {
    let tipp = await this.findOne(game, user);
    if (!tipp) {
      tipp = this.sbRepo.create({
        user,
        game,
        pointDiff,
        winner,
      });
    } else {
      tipp.winner = winner;
      tipp.pointDiff = pointDiff;
    }

    return this.sbRepo.save(tipp);
  }

  async remove(id: string): Promise<void> {
    await this.sbRepo.delete(id);
  }
}
