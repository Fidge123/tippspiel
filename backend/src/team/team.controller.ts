import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../permissions.decorator';
import { PermissionsGuard } from '../permissions.guard';

import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get('games')
  @Permissions('read:tipp')
  async getTeams(): Promise<any> {
    return this.teamService.findAll();
  }
}
