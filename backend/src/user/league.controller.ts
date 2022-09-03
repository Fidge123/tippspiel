import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { loadHTML, loadTXT } from '../templates/loadTemplate';
import { getTransporter } from '../email';

import { LeagueDataService } from '../database/league.service';
import { CurrentUser, User } from '../user.decorator';
import { LeagueEntity } from 'src/database/entity';

@Controller('leagues')
export class LeagueController {
  constructor(private readonly databaseService: LeagueDataService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getLeagues(@CurrentUser() user: User): Promise<LeagueEntity[]> {
    const leagues = await this.databaseService.getAllLeagues();
    return leagues.filter(
      (l) =>
        l.members.some((m) => m.id === user.id) ||
        l.admins.some((a) => a.id === user.id),
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createLeague(
    @Body('name') name: string,
    @CurrentUser() user: User,
  ): Promise<LeagueEntity> {
    return await this.databaseService.createLeague(name, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  async addMember(
    @Body('leagueId') leagueId: string,
    @Body('email') email: string,
  ): Promise<LeagueEntity> {
    // Send notification or sign up mail?
    return await this.databaseService.addMember(leagueId, email);
  }
}
