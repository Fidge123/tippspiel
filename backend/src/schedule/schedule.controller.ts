import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WeekEntity } from '../database/entity';
import { ScheduleDataService } from '../database/schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly databaseService: ScheduleDataService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':year')
  async getSchedule(@Param('year') year: string): Promise<WeekEntity[]> {
    return await this.databaseService.getSchedule(parseInt(year, 10));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':year/:seasontype/:week')
  async getWeek(
    @Param('year') year: string,
    @Param('seasontype') seasontype: string,
    @Param('week') week: string,
  ): Promise<WeekEntity[]> {
    return await this.databaseService.getWeek(
      parseInt(year, 10),
      parseInt(seasontype, 10),
      parseInt(week, 10),
    );
  }
}
