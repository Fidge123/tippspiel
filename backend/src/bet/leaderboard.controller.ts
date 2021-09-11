import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { BetDoublerEntity, BetEntity, GameEntity } from '../database/entity';
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
    const doublers = await this.databaseService.findBetDoublersForStratedGames(
      parseInt(season, 10),
    );

    return games.reduce(
      (result, game) => ({
        ...result,
        [game.id]: game.bets.map((bet) => ({
          name: bet.user.name,
          winner: bet.winner,
          bet: bet.pointDiff,
          doubler: doublers.some(
            (d) => d.user.id === bet.user.id && d.game.id === game.id,
          ),
          points: calculatePoints(
            game,
            bet,
            doublers.filter((d) => d.user.id === bet.user.id),
          ).points.reduce((a, b) => a + b, 0),
        })),
      }),
      {},
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':season')
  async getAll(@Param('season') season: string): Promise<any> {
    const users = await this.databaseService.findBetsByUser(
      parseInt(season, 10),
    );

    const doublers = await this.databaseService.findBetDoublersForStratedGames(
      parseInt(season, 10),
    );

    return users.map((user) => ({
      user: user.name,
      bets: user.bets.map((bet) =>
        calculatePoints(
          bet.game,
          bet,
          doublers.filter((d) => d.user.id === user.id),
        ),
      ),
    }));
  }
}

function correctTeam(bet: string, winner: string) {
  return bet === winner ? 1 : 0;
}

function withinPoints(
  pointDiff: number,
  winner: string,
  correctDiff: number,
  allowedDiff: number,
) {
  const multi = winner === 'home' ? 1 : -1;
  return Math.abs(multi * pointDiff - correctDiff) <= allowedDiff ? 1 : 0;
}

function calculatePoints(
  { homeScore, awayScore, winner: actualWinner, id }: GameEntity,
  { pointDiff, winner: predictedWinnner }: BetEntity,
  doublers: BetDoublerEntity[],
) {
  const correctDiff = homeScore - awayScore;
  const multi = doublers.some((d) => d.game.id === id) ? 2 : 1;

  return {
    id,
    points: [
      correctTeam(predictedWinnner, actualWinner) * 2 * multi,
      withinPoints(pointDiff, predictedWinnner, correctDiff, 0) * 1 * multi,
      withinPoints(pointDiff, predictedWinnner, correctDiff, 3) * 1 * multi,
      withinPoints(pointDiff, predictedWinnner, correctDiff, 6) * 1 * multi,
    ],
  };
}
