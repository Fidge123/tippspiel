import { Controller, Get, Param } from '@nestjs/common';
import { TeamEntity } from './entity';

import { ScheduleService } from './schedule.service';

@Controller('team')
export class TeamController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getAll(): Promise<TeamEntity[]> {
    return await this.scheduleService.getTeams();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<TeamEntity> {
    return await this.scheduleService.getTeam(id);
  }
}
