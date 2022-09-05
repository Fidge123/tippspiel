import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ScheduleDataService } from '../database/schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly databaseService: ScheduleDataService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':year')
  async getSchedule(@Param('year') year: string): Promise<any[]> {
    const [schedule, byes] = await Promise.all([
      this.databaseService.getSchedule(parseInt(year, 10)),
      this.databaseService.getByes(parseInt(year, 10)),
    ]);
    return schedule.map((week, i) => ({
      ...week,
      teamsOnBye: byes[i].byes.map((b) => b.team),
    }));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':year/:seasontype/:week')
  async getWeek(
    @Param('year') year: string,
    @Param('seasontype') seasontype: string,
    @Param('week') week: string,
  ): Promise<any> {
    const [schedule, byes] = await Promise.all([
      this.databaseService.getWeek(`${year}-${seasontype}-${week}`),
      this.databaseService.getByesForWeek(`${year}-${seasontype}-${week}`),
    ]);
    return { ...schedule, teamsOnBye: byes.byes.map((b) => b.team) };
  }
}
