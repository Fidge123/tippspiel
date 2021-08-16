import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../permissions.decorator';
import { PermissionsGuard } from '../permissions.guard';
import { CurrentUser, User } from '../user.decorator';

import { BetDataService } from '../database/bet.service';
import { BetEntity } from '../database/entity';
import { CreateBetDto } from './bet.dto';

@Controller('bet')
export class BetController {
  constructor(private readonly databaseService: BetDataService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get()
  @Permissions('read:bet')
  async getAll(
    @Query('season') season: string,
    user: string = '315cbdfc-195a-4f29-8b9b-d820179109df',
    // @CurrentUser() user: User
  ): Promise<any> {
    const games = await this.databaseService.findBetsByGame(
      parseInt(season, 10),
    );

    return games
      .map((game) => ({
        id: game.id,
        bets: {
          home: game.bets.filter((bet) => bet.winner === 'home').length,
          away: game.bets.filter((bet) => bet.winner === 'away').length,
        },
        selected: game.bets.find((bet) => bet.user.id === user).winner,
        points: game.bets.find((bet) => bet.user.id === user).pointDiff,
      }))
      .reduce(
        (result, game) => ({
          ...result,
          [game.id]: game,
        }),
        {},
      );
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post()
  @Permissions('write:bet')
  async setTipp(
    @Body() createTipp: CreateBetDto,
    user: string = '315cbdfc-195a-4f29-8b9b-d820179109df',
    // @CurrentUser() user: User,
  ): Promise<BetEntity> {
    return this.databaseService.update(createTipp, user);
  }
}
