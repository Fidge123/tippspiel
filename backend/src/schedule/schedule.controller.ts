import { Controller, Get, Param } from '@nestjs/common';

import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get(':season')
  async getAll(@Param('season') season: string): Promise<any[]> {
    return; // this.scheduleService.findAll();
  }
}
