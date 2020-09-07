import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scoreboard } from './scoreboard.entity';
import { Scoreboard as SB } from './scoreboard.type';
import axios from 'axios';

@Injectable()
export class ScoreboardService {
  constructor(
    @InjectRepository(Scoreboard)
    private sbRepo: Repository<Scoreboard>,
  ) {}

  findAll(): Promise<Scoreboard[]> {
    return this.sbRepo.find();
  }

  findOne(url: string): Promise<Scoreboard> {
    return this.sbRepo.findOne(url);
  }

  async add(url: string): Promise<SB> {
    const exists = await this.findOne(url);
    if (!exists) {
      console.log(url);
      const res = await axios.get<SB>(url);
      console.log(res.data);

      const sb = this.sbRepo.create({ url, response: res.data });
      return (await this.sbRepo.save(sb)).response;
    }
  }

  async remove(id: string): Promise<void> {
    await this.sbRepo.delete(id);
  }
}
