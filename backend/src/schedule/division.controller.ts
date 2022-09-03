import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { DivisionEntity } from '../database/entity';
import { ScheduleDataService } from '../database/schedule.service';

@Controller('division')
export class DivisionController {
  constructor(private readonly databaseService: ScheduleDataService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAll(
    @Query('league') league: string,
    @Query('season') season: string,
  ): Promise<DivisionEntity[]> {
    return await this.databaseService.getDivisions(
      league,
      parseInt(season, 10),
    );
  }
}
