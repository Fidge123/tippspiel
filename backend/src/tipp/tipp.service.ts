import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tipp } from './tipp.entity';
import { CreateTippDto } from './tipp.dto';

@Injectable()
export class TippService {
  constructor(
    @InjectRepository(Tipp)
    private tRepo: Repository<Tipp>,
  ) {}

  findAll(): Promise<Tipp[]> {
    return this.tRepo.find();
  }

  findOne(user: string, game: string): Promise<Tipp> {
    return this.tRepo.findOne({ game, user });
  }

  async update(
    { game, pointDiff, winner }: CreateTippDto,
    user: string,
  ): Promise<Tipp> {
    const tipp = this.tRepo.create({
      user,
      game,
      pointDiff,
      winner,
    });
    return this.tRepo.save(tipp);
  }

  async remove(id: string): Promise<void> {
    await this.tRepo.delete(id);
  }
}
