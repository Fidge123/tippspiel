import { Controller, Get, Param } from '@nestjs/common';

import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly sbService: ScheduleService) {}

  @Get(':season')
  async getSchedule(@Param('season') season: string): Promise<any[]> {
    return this.sbService.getSeason(season);
  }
}
