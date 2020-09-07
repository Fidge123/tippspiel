import { stringify } from 'querystring';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoreboardEntity } from './scoreboard.entity';
import { Scoreboard, BASE_URL } from './scoreboard.type';
import axios from 'axios';

@Injectable()
export class ScoreboardService {
  constructor(
    @InjectRepository(ScoreboardEntity)
    private sbRepo: Repository<ScoreboardEntity>,
  ) {}

  findAll(): Promise<ScoreboardEntity[]> {
    return this.sbRepo.find();
  }

  findOne(
    dates: number,
    seasontype: number,
    week: number,
  ): Promise<ScoreboardEntity> {
    return this.sbRepo.findOne({ dates, seasontype, week });
  }

  async update(
    dates: number,
    seasontype: number,
    week: number,
  ): Promise<Scoreboard> {
    const url = `${BASE_URL}?${stringify({
      dates,
      seasontype,
      week,
    })}`;
    const response = (await axios.get<Scoreboard>(url)).data;

    if (response.events) {
      let sb = await this.findOne(dates, seasontype, week);
      if (!sb) {
        sb = this.sbRepo.create({
          dates,
          seasontype,
          week,
          response,
        });
      } else {
        sb.response = response;
      }
      return (await this.sbRepo.save(sb)).response;
    }
  }

  async remove(id: string): Promise<void> {
    await this.sbRepo.delete(id);
  }
}
