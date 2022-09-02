import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

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
    const memberIn = await this.databaseService.getParticipatedLeagues(user.id);
    const adminIn = await this.databaseService.getAdministeredLeague(user.id);
    return [...memberIn, ...adminIn];
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createLeague(
    @Body('name') name: string,
    @CurrentUser() user: User,
  ): Promise<LeagueEntity> {
    return await this.databaseService.createLeague(name, user.id);
  }
}
