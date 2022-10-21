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
  @Post('delete')
  async deleteLeague(
    @Body('leagueId') leagueId: string,
    @CurrentUser() user: User,
  ): Promise<LeagueEntity> {
    return await this.databaseService.removeLeague(leagueId, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  async addMember(
    @Body('leagueId') leagueId: string,
    @Body('email') email: string,
    @CurrentUser() user: User,
  ): Promise<LeagueEntity> {
    return await this.databaseService.addMember(leagueId, email, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('kick')
  async kickMember(
    @Body('leagueId') leagueId: string,
    @Body('userId') userId: string,
    @CurrentUser() user: User,
  ): Promise<LeagueEntity> {
    return await this.databaseService.removeMember(leagueId, userId, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('promote')
  async promoteMember(
    @Body('leagueId') leagueId: string,
    @Body('userId') userId: string,
    @CurrentUser() user: User,
  ): Promise<LeagueEntity> {
    return await this.databaseService.addAdmin(leagueId, userId, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('demote')
  async demoteAdmin(
    @Body('leagueId') leagueId: string,
    @Body('userId') userId: string,
    @CurrentUser() user: User,
  ): Promise<LeagueEntity> {
    return await this.databaseService.removeAdmin(leagueId, userId, user.id);
  }
}
