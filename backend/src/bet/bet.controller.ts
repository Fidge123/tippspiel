import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
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
import {
  CreateDoublerDto,
  DeleteDoublerDto,
  GetDoublerDto,
} from './doubler.dto';
import { CreateSBBetDto } from './superbowl.dto';

@Controller('bet')
export class BetController {
  constructor(private readonly databaseService: BetDataService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAll(
    @Query('league') league: string,
    @Query('season') season: string,
    @CurrentUser() user: User,
  ): Promise<any> {
    const games = await this.databaseService.findBets(
      league,
      parseInt(season, 10),
    );

    return games.map((game) => ({
      id: game.id,
      bets: {
        home: game.bets.filter((bet) => bet.winner === 'home').length,
        away: game.bets.filter((bet) => bet.winner === 'away').length,
      },
      selected: game.bets.find((bet) => bet.user.id === user.id)?.winner,
      points: game.bets.find((bet) => bet.user.id === user.id)?.pointDiff,
    }));
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async setGameBet(
    @Body() createBet: CreateBetDto,
    @CurrentUser() user: User,
  ): Promise<BetEntity> {
    return this.databaseService.setGameBet(createBet, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('division')
  async getDivisionBets(
    @Query('league') league: string,
    @Query('season') season: string,
    @CurrentUser() user: User,
  ): Promise<any> {
    const bets = await this.databaseService.findDivisionBets(
      league,
      parseInt(season, 10),
      user.id,
    );
    return bets.map((bet) => ({
      name: bet.division.name,
      teams: [bet.first, bet.second, bet.third, bet.fourth],
    }));
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
  async getSbBets(
    @Query('league') league: string,
    @Query('season') season: string,
    @CurrentUser() user: User,
  ): Promise<any> {
    return (
      (await this.databaseService.findSbBets(
        league,
        parseInt(season, 10),
        user.id,
      )) || {}
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('superbowl')
  async setSbBet(
    @Body() createBet: CreateSBBetDto,
    @CurrentUser() user: User,
  ): Promise<SuperbowlBetEntity> {
    return this.databaseService.setSbBet(createBet, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('doubler')
  async getBetDoublers(
    @Query('league') league: string,
    @Query('season') season: string,
    @CurrentUser() user: User,
  ): Promise<GetDoublerDto[]> {
    const doublers = await this.databaseService.findBetDoublers(
      league,
      parseInt(season, 10),
      user.id,
    );
    return doublers.map((d) => ({
      game: d.game.id,
      week: `${d.week.year}-${d.week.seasontype}-${d.week.week}`,
      league: d.league?.id,
    }));
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('doubler')
  async setBetDoublers(
    @Body() createDoubler: CreateDoublerDto,
    @CurrentUser() user: User,
  ): Promise<BetDoublerEntity> {
    return this.databaseService.setBetDoubler(createDoubler, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('doubler')
  async removeBetDoublers(
    @Body() deleteDoubler: DeleteDoublerDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.databaseService.deleteBetDoubler(deleteDoubler, user.id);
  }
}
