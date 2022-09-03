import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CurrentUser, User } from '../user.decorator';
import { BetDoublerEntity, BetEntity, GameEntity } from '../database/entity';
import { BetDataService } from '../database/bet.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly databaseService: BetDataService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('games')
  async getBetsForStartedGames(
    @Query('league') league: string,
    @Query('season') season: string,
  ): Promise<any> {
    const games = await this.databaseService.findBetsForStartedGames(
      league,
      parseInt(season, 10),
    );
    const doublers = await this.databaseService.findBetDoublersForStartedGames(
      league,
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
  @Get()
  async getAll(
    @Query('league') league: string,
    @Query('season') season: string,
    @CurrentUser() currentUser: User,
  ): Promise<any> {
    const users = await this.databaseService.findBetsByUser(
      league,
      parseInt(season, 10),
    );

    const st = await this.databaseService.findCurrentWeek();
    const sbWinner = await this.databaseService.findSbWinner(
      parseInt(season, 10),
    );

    const doublers = await this.databaseService.findBetDoublersForStartedGames(
      league,
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
      divBets: user.divisionBets.map((bet) => ({
        name: bet.division.name,
        team: st.seasontype === 3 || user.id === currentUser.id ? bet.team : {},
        points:
          st.seasontype === 3 &&
          bet.team.playoffSeed > 0 &&
          bet.team.playoffSeed <= 4
            ? 5
            : 0,
      })),
      sbBet: {
        team:
          (st.seasontype === 3 && st.week === 5) || user.id === currentUser.id
            ? user.superbowlBets[0]?.team
            : {},
        points: sbWinner ? user.superbowlBets[0]?.team.id === sbWinner.id : 0,
      },
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
