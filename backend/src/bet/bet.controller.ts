import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CurrentUser, User } from '../user.decorator';

import { BetDataService } from '../database/bet.service';
import { BetEntity } from '../database/entity';
import { CreateBetDto } from './bet.dto';

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
    @Body() createTipp: CreateBetDto,
    @CurrentUser() user: User,
  ): Promise<BetEntity> {
    return this.databaseService.update(createTipp, user.id);
  }
}
