import {
  Controller,
  Get,
  UseGuards,
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
  UserEntity,
} from '../database/entity';
import { BetDataService } from '../database/bet.service';
import { LeagueDataService } from '../database/league.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly dbService: BetDataService,
    private readonly leagueService: LeagueDataService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('games')
  async getBetsForStartedGames(
    @Query('league') league: string,
    @Query('season') season: string,
  ): Promise<any> {
    const [games, doublers] = await Promise.all([
      this.dbService.startedGames(league, parseInt(season, 10)),
      this.dbService.startedDoublers(league, parseInt(season, 10)),
    ]);
    return games.reduce(
      (result, game) => ({
        ...result,
        [game.id]: game.bets.map((bet) => ({
          name: bet.user.name,
          winner: bet.winner,
          bet: bet.pointDiff,
          doubler: doublers.some(
            (d) => d.game.id === game.id && d.user.id === bet.user.id,
          ),
          points: calcPoints(game, bet.user, doublers),
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

    const w = await this.dbService.findCurrentWeek();
    const isPlayoffs = w.seasontype === 3;
    const isFinalGame = isPlayoffs && w.week === 5;

    const [games, doublers, sbWinner] = await Promise.all([
      this.dbService.finishedGames(league, season),
      this.dbService.finishedDoublers(league, season),
      this.dbService.findSbWinner(season),
    ]);

    return (
      await Promise.all(
        users.map(async (user) => {
          const divBets =
            isPlayoffs || user.id === me.id
              ? await this.dbService.userDivBets(user.id, league, season)
              : [];
          const sbBet =
            isFinalGame || user.id === me.id
              ? await this.dbService.userSbBets(user.id, league, season)
              : null;
          const response = {
            user: { id: user.id, name: user.name },
            bets: games.map((game) => ({
              game: game.id,
              bet: formatBet(game.bets.find((bet) => bet.user.id === user.id)),
              doubler: getMult(doublers, game, user) === 2,
              bonus: getBonus(
                game.bets.find((bet) => bet.user.id === user.id)?.winner,
                game.bets,
              ),
              points: calcPoints(game, user, doublers),
            })),
            divBets: divBets.map((bet) => ({
              name: bet.division.name,
              first: bet.first,
              second: bet.second,
              third: bet.third,
              fourth: bet.fourth,
              points: isPlayoffs ? calcDivisionPoints(bet) : 0,
            })),
            sbBet: {
              team: sbBet?.team ?? {},
              points: sbWinner && sbBet?.team.id === sbWinner.id ? 20 : 0,
            },
          };
          const sums = {
            bets: response.bets.reduce((a, b) => a + b.points, 0),
            divBets: response.divBets.reduce((a, b) => a + b.points, 0),
            sbBet: response.sbBet.points,
          };

          return {
            ...response,
            points: { ...sums, all: sums.bets + sums.divBets + sums.sbBet },
          };
        }),
      )
    ).sort((u1, u2) => u2.points.all - u1.points.all);
  }
}

function formatBet(bet?: BetEntity) {
  return bet
    ? { id: bet.id, pointDiff: bet.pointDiff, winner: bet.winner }
    : undefined;
}

function calcDivisionPoints(bet: DivisionBetEntity) {
  let score = 0;
  const bets = [bet.first, bet.second, bet.third, bet.fourth];
  const correctOrder = bets.sort((a, b) => a.playoffSeed - b.playoffSeed);
  if (bet.first && bet.first.id === correctOrder[0].id) {
    score += 7;
  }
  if (bet.second && bet.second.id === correctOrder[1].id) {
    score += 1;
  }
  if (bet.third && bet.third.id === correctOrder[2].id) {
    score += 1;
  }
  if (bet.fourth && bet.fourth.id === correctOrder[3].id) {
    score += 1;
  }
  if (score === 10) {
    score += 5;
  }
  return score;
}

function getMult(
  doublers: BetDoublerEntity[],
  game: GameEntity,
  user: UserEntity,
): 1 | 2 {
  return doublers.some((d) => d.game.id === game.id && d.user.id === user.id)
    ? 2
    : 1;
}

function getBonus(winner: string, bets: BetEntity[]) {
  return bets.filter((b) => b.winner !== winner).length * 3 <= bets.length;
}

function calcPoints(
  game: GameEntity,
  user: UserEntity,
  doublers: BetDoublerEntity[],
) {
  const bet = game.bets.find((bet) => bet.user.id === user.id);

  if (!bet) {
    return -1;
  }

  const multi = getMult(doublers, game, user);
  const extraPoint = getBonus(bet.winner, game.bets);

  if (game.homeScore > game.awayScore) {
    if (bet.winner === 'home') {
      return (bet.pointDiff + (extraPoint ? 1 : 0)) * multi;
    }
    return -bet.pointDiff;
  }

  if (game.awayScore > game.homeScore) {
    if (bet.winner === 'away') {
      return (bet.pointDiff + (extraPoint ? 1 : 0)) * multi;
    }
    return -bet.pointDiff;
  }

  if (game.awayScore === game.homeScore) {
    return 0;
  }
}

// function correctTeam(bet: string, winner: string) {
//   return bet === winner ? 1 : 0;
// }

// function withinPoints(
//   pointDiff: number,
//   winner: string,
//   correctDiff: number,
//   allowedDiff: number,
// ) {
//   const multi = winner === 'home' ? 1 : -1;
//   return Math.abs(multi * pointDiff - correctDiff) <= allowedDiff ? 1 : 0;
// }

// function calculatePoints2021(
//   { homeScore, awayScore, winner: actualWinner, id }: GameEntity,
//   { pointDiff, winner: predictedWinnner }: BetEntity,
//   doublers: BetDoublerEntity[],
// ) {
//   const correctDiff = homeScore - awayScore;
//   const multi = doublers.some((d) => d.game.id === id) ? 2 : 1;

//   return {
//     id,
//     points: [
//       correctTeam(predictedWinnner, actualWinner) * 2 * multi,
//       withinPoints(pointDiff, predictedWinnner, correctDiff, 0) * 1 * multi,
//       withinPoints(pointDiff, predictedWinnner, correctDiff, 3) * 1 * multi,
//       withinPoints(pointDiff, predictedWinnner, correctDiff, 6) * 1 * multi,
//     ],
//   };
// }
