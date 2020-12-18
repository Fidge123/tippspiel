import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './Schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private sbRepo: Repository<Schedule>,
  ) {}

  async findSchedulesByWeek(
    seasontype: number,
    season: number,
    week: number,
  ): Promise<Schedule[]> {
    return this.sbRepo.find({ where: { season } });
  }
}
