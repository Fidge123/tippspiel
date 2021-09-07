import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CurrentUser, User } from '../user.decorator';

import { BetDataService } from '../database/bet.service';
import {
  BetDoublerEntity,
  BetEntity,
  DivisionBetEntity,
  SuperbowlBetEntity,
} from '../database/entity';
import { CreateBetDto } from './bet.dto';
import { CreateDivisionBetDto } from './division.dto';
import { CreateDoublerDto } from './doubler.dto';

@Controller('bet')
export class BetController {
  constructor(private readonly databaseService: BetDataService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAll(
    @Query('season') season: string,
    @CurrentUser() user: User,
  ): Promise<any> {
    const games = await this.databaseService.findBets(parseInt(season, 10));

    return games
      .map((game) => ({
        id: game.id,
        bets: {
          home: game.bets.filter((bet) => bet.winner === 'home').length,
          away: game.bets.filter((bet) => bet.winner === 'away').length,
        },
        selected: game.bets.find((bet) => bet.user.id === user.id)?.winner,
        points: game.bets.find((bet) => bet.user.id === user.id)?.pointDiff,
      }))
      .reduce(
        (result, game) => ({
          ...result,
          [game.id]: game,
        }),
        {},
      );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async setBet(
    @Body() createBet: CreateBetDto,
    @CurrentUser() user: User,
  ): Promise<BetEntity> {
    return this.databaseService.update(createBet, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('division')
  async getDivisionBets(@CurrentUser() user: User): Promise<any> {
    return (await this.databaseService.findDivisionBets(user.id)).reduce(
      (result, bet) => ({ ...result, [bet.division.name]: bet.team.id }),
      {},
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('division')
  async setDivisionBet(
    @Body() createBet: CreateDivisionBetDto,
    @CurrentUser() user: User,
  ): Promise<DivisionBetEntity> {
    return this.databaseService.setDivisionBet(createBet, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('superbowl')
  async getSbBets(@CurrentUser() user: User): Promise<any> {
    return await this.databaseService.findSbBets(user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('superbowl')
  async setSbBet(
    @Body() createBet: any,
    @CurrentUser() user: User,
  ): Promise<SuperbowlBetEntity> {
    return this.databaseService.setSbBet(createBet.teamId, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('doubler')
  async getBetDoublers(@CurrentUser() user: User): Promise<any> {
    return await this.databaseService.findBetDoublers(user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('doubler')
  async setBetDoublers(
    @Body() createBet: CreateDoublerDto,
    @CurrentUser() user: User,
  ): Promise<BetDoublerEntity> {
    return this.databaseService.setBetDoubler(
      createBet.gameID,
      createBet.weekID,
      user.id,
    );
  }
}
