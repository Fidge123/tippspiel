import { stringify } from 'querystring';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoreboardEntity } from './scoreboard.entity';
import { Scoreboard, BASE_URL, Competition, NFLEvent } from './scoreboard.type';
import axios from 'axios';

@Injectable()
export class ScoreboardService {
  constructor(
    @InjectRepository(ScoreboardEntity)
    private sbRepo: Repository<ScoreboardEntity>,
  ) {}

  async findAll(): Promise<ScoreboardEntity[]> {
    return this.sbRepo.find();
  }

  async findStarted(dates: number): Promise<Competition[]> {
    const weeks = await this.sbRepo.find({ where: { dates } });
    return weeks
      .reduce(
        (events: NFLEvent[], week) => [
          ...events,
          ...week.response.events.filter(
            e =>
              new Date(e.date) < new Date() &&
              e.status.type.name !== 'STATUS_FINAL',
          ),
        ],
        [],
      )
      .map(ev => ev.competitions[0]);
  }

  async findFinished(dates: number): Promise<Competition[]> {
    const weeks = await this.sbRepo.find({ where: { dates } });
    return weeks
      .reduce(
        (events: NFLEvent[], week) => [
          ...events,
          ...week.response.events.filter(
            e => e.status.type.name === 'STATUS_FINAL',
          ),
        ],
        [],
      )
      .map(ev => ev.competitions[0]);
  }

  async findOne(
    dates: number,
    seasontype: number,
    week: number,
  ): Promise<ScoreboardEntity> {
    return this.sbRepo.findOne({ dates, seasontype, week });
  }

  async competitionById(gameId: string): Promise<Competition> {
    const weeks = await this.sbRepo.find({ select: ['response'] });
    for (const week of weeks) {
      for (const event of week.response.events) {
        if (event.id === gameId) {
          return event.competitions[0];
        }
      }
    }
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
