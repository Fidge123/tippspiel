import {
  Controller,
  Get,
  UseGuards,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CurrentUser, User } from '../user.decorator';
import type {
  BetDoublerEntity,
  BetEntity,
  DivisionBetEntity,
  GameEntity,
  SuperbowlBetEntity,
  UserEntity,
} from '../database/entity';
import { BetDataService } from '../database/bet.service';
import { LeagueDataService } from '../database/league.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly databaseService: BetDataService,
    private readonly leagueService: LeagueDataService,
  ) {}

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
          points: calculatePoints2021(
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
    @Query('season') seasonStr: string,
    @CurrentUser() me: User,
  ): Promise<any> {
    const { members: users, season } = await this.leagueService.getLeague(
      league,
    );
    if (parseInt(seasonStr, 10) !== season) {
      throw new BadRequestException();
    }

    const { seasontype, week: currentWeek } =
      await this.databaseService.findCurrentWeek();
    const [sbWinner, doublers] = await Promise.all([
      this.databaseService.findSbWinner(season),
      this.databaseService.findBetDoublersForStartedGames(league, season),
    ]);

    function calcDivisionPoints(bet: DivisionBetEntity) {
      let score = 0;
      const bets = [bet.first, bet.second, bet.third, bet.fourth];
      const correctOrder = bets.sort((a, b) => a.playoffSeed - b.playoffSeed);
      if (bets[0].id === correctOrder[0].id) {
        score += 7;
      }
      if (bet[1].id === correctOrder[1].id) {
        score += 1;
      }
      if (bet[2].id === correctOrder[2].id) {
        score += 1;
      }
      if (bet[3].id === correctOrder[3].id) {
        score += 1;
      }
      if (score === 10) {
        score += 5;
      }
      return score;
    }

    function formatSbBet(
      sbBet: SuperbowlBetEntity | undefined,
      user: UserEntity,
    ) {
      return {
        team:
          sbBet?.team &&
          ((seasontype === 3 && currentWeek === 5) || user.id === me.id)
            ? sbBet.team
            : {},
        points: sbWinner && sbBet?.team.id === sbWinner.id ? 20 : 0,
      };
    }

    return Promise.all(
      users.map(async (user) => ({
        user: user.name,
        bets: (
          await this.databaseService.findGameBetsForUser(
            user.id,
            league,
            season,
          )
        ).map((bet) =>
          calculatePoints2021(
            bet.game,
            bet,
            doublers.filter((d) => d.user.id === user.id),
          ),
        ),
        divBets: (
          await this.databaseService.findDivisionBetsForUser(
            user.id,
            league,
            season,
          )
        ).map((bet) => ({
          name: bet.division.name,
          first: seasontype === 3 || user.id === me.id ? bet.first : {},
          second: seasontype === 3 || user.id === me.id ? bet.second : {},
          third: seasontype === 3 || user.id === me.id ? bet.third : {},
          fourth: seasontype === 3 || user.id === me.id ? bet.fourth : {},
          points: seasontype === 3 ? calcDivisionPoints(bet) : 0,
        })),
        sbBet: formatSbBet(
          await this.databaseService.findSbBetsForUser(user.id, league, season),
          user,
        ),
      })),
    );
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

function calculatePoints2021(
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
