import { Controller, Get } from '@nestjs/common';
import { DivisionEntity } from '../database/entity';
import { ScheduleDataService } from '../database/schedule.service';

@Controller('division')
export class DivisionController {
  constructor(private readonly databaseService: ScheduleDataService) {}

  @Get()
  async getAll(): Promise<DivisionEntity[]> {
    return await this.databaseService.getDivisions();
  }
}
