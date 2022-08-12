import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { DivisionEntity } from '../database/entity';
import { ScheduleDataService } from '../database/schedule.service';

@Controller('division')
export class DivisionController {
  constructor(private readonly databaseService: ScheduleDataService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAll(): Promise<DivisionEntity[]> {
    return await this.databaseService.getDivisions();
  }
}
