import { Controller, Get, Post, Param } from '@nestjs/common';
import { ScoreboardService } from './scoreboard.service';
import { Scoreboard, BASE_URL } from './scoreboard.type';

@Controller()
export class ScoreboardController {
  constructor(private readonly sbService: ScoreboardService) {}

  @Get()
  async getAll(): Promise<string[]> {
    return (await this.sbService.findAll()).map(sb => sb.url);
  }

  @Post(':week')
  async load(@Param('week') week: number): Promise<Scoreboard> {
    return this.sbService.add(`${BASE_URL}?week=${week}`);
  }
}
