import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tipp } from './tipp.entity';
import { CreateTippDto } from './tipp.dto';
import { ScoreboardService } from 'src/scoreboard/scoreboard.service';

@Injectable()
export class TippService {
  constructor(
    @InjectRepository(Tipp)
    private tRepo: Repository<Tipp>,
    private readonly sbService: ScoreboardService,
  ) {}

  async findAll(): Promise<Tipp[]> {
    return this.tRepo.find();
  }

  async findOne(user: string, game: string): Promise<Tipp> {
    return this.tRepo.findOne({ game, user });
  }

  async update(
    { game, pointDiff, winner }: CreateTippDto,
    user: string,
  ): Promise<Tipp> {
    const c = await this.sbService.competitionById(game);
    console.log(c.startDate);
    if (new Date() < new Date(c.startDate)) {
      const tipp = this.tRepo.create({
        user,
        game,
        pointDiff,
        winner,
      });
      return this.tRepo.save(tipp);
    }
  }

  async remove(id: string): Promise<void> {
    await this.tRepo.delete(id);
  }
}
