import { Controller, Get, Param } from '@nestjs/common';

import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get(':year')
  async getSchedule(@Param('year') year: string): Promise<any[]> {
    return await this.scheduleService.getSchedule(parseInt(year, 10));
  }

  @Get(':year/:seasontype/:week')
  async getWeek(
    @Param('year') year: string,
    @Param('seasontype') seasontype: string,
    @Param('week') week: string,
  ): Promise<any[]> {
    return await this.scheduleService.getWeek(
      parseInt(year, 10),
      parseInt(seasontype, 10),
      parseInt(week, 10),
    );
  }
}
