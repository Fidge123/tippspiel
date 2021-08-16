import { Controller, Get, Param } from '@nestjs/common';
import { TeamEntity } from '../database/entity';
import { ScheduleDataService } from '../database/schedule.service';

@Controller('team')
export class TeamController {
  constructor(private readonly databaseService: ScheduleDataService) {}

  @Get()
  async getAll(): Promise<TeamEntity[]> {
    return await this.databaseService.getTeams();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<TeamEntity> {
    return await this.databaseService.getTeam(id);
  }
}
