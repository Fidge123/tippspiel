import { Controller, Get, Param } from '@nestjs/common';

import { ScheduleService } from './schedule.service';

@Controller('team')
export class TeamController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getAll(): Promise<any[]> {
    return await this.scheduleService.getTeams();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<any> {
    return await this.scheduleService.getTeam(id);
  }
}
