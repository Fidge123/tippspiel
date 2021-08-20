import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { BetEntity, GameEntity } from '../database/entity';
import { BetDataService } from '../database/bet.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly databaseService: BetDataService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('games')
  async getBetsForStartedGames(@Query('season') season: string): Promise<any> {
    const games = await this.databaseService.findBetsForStartedGames(
      parseInt(season, 10),
    );

    return games.reduce(
      (result, game) => ({
        ...result,
        [game.id]: game.bets.reduce(
          (res, bet) => ({
            ...res,
            [bet.user.id]: {
              name: bet.user.name,
              winner: bet.winner,
              tipp: bet.pointDiff,
            },
          }),
          {},
        ),
      }),
      {},
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':season')
  async getAll(@Param('season') season: string): Promise<any> {
    const games = await this.databaseService.findBetsByGame(
      parseInt(season, 10),
    );
    const scores = games.map((game) => calculatePoints(game));
    const users = await this.databaseService.findBetsByUser(
      parseInt(season, 10),
    );
    return users.reduce(
      (result, user) => ({
        ...result,
        [user.id]: user.bets.reduce((res, bet) => ({
          ...res,
          [bet.game.id]: scores
            .find((score) => score.id === bet.game.id)
            .bets.find((bet) => bet.user === user.id).points,
        })),
      }),
      {},
    );
  }
}

function calcBonus(
  correctDiff: number,
  winner: 'home' | 'away' | 'none',
  tipp: BetEntity,
  tipps: BetEntity[],
) {
  return Math.max(
    tipps.reduce((a, b) => {
      const closerToCorrect =
        Math.abs(correctDiff - b.pointDiff) <
        Math.abs(correctDiff - tipp.pointDiff);

      return b.winner === winner && closerToCorrect ? a - 1 : a;
    }, 3),
    0,
  );
}

function calculatePoints({
  homeScore,
  awayScore,
  winner,
  bets,
  id,
}: GameEntity) {
  const correctDiff = Math.abs(homeScore - awayScore);

  return {
    id,
    bets: bets.map((bet) => ({
      user: bet.user.id,
      points:
        bet.winner === winner
          ? 1 + calcBonus(correctDiff, winner, bet, bets)
          : 0,
    })),
  };
}
