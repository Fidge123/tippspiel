import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../permissions.decorator';
import { PermissionsGuard } from '../permissions.guard';

import { BetEntity, UserEntity } from '../database/entity';
import { BetDataService } from '../database/bet.service';
import { UserDataService } from '../database/user.service';
import { ScoreboardService } from '../scoreboard/scoreboard.service';
import { Competition, Competitors } from '../scoreboard/scoreboard.type';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly databaseService: BetDataService,
    private readonly userService: UserDataService,
    private readonly sbService: ScoreboardService,
  ) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get('games')
  @Permissions('read:bet')
  async getTippsForStartedGames(@Query('season') season: string): Promise<any> {
    const users = await this.userService.findAll();
    const started = await this.sbService.findStarted(parseInt(season, 10));
    const finished = await this.sbService.findFinished(parseInt(season, 10));
    const games = [...started, ...finished];

    let result: any = {};

    for (const game of games) {
      const tipps = await this.databaseService.findGame(game.id);

      result = {
        ...result,
        [game.id]: tipps.reduce((res, t) => {
          const user =
            users.find((u) => u.email === t.user.email)?.name || t.user.email;

          return {
            ...res,
            [user]: {
              winner: t.winner,
              tipp: t.pointDiff,
            },
          };
        }, {} as any),
      };
    }
    return result;
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(':season')
  @Permissions('read:bet')
  async getAll(@Param('season') season: string): Promise<any> {
    const games = await this.sbService.findFinished(parseInt(season, 10));
    const users = await this.userService.findAll();
    const lb: any = {};
    for (const game of games) {
      const tipps = await this.databaseService.findGame(game.id);
      const points = calculatePoints(game, tipps, users);

      points.forEach((c) => {
        lb[c.user] = { ...lb[c.user], [game.id]: c.points };
      });
    }
    return lb;
  }
}

function getWinner(comp: Competitors[]): 'home' | 'away' | undefined {
  const winners = comp.filter((team) => team.winner);
  if (winners.length === 1) {
    return winners[0].homeAway;
  }
}

function calcBonus(
  correctDiff: number,
  winner: 'home' | 'away',
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

function calculatePoints(
  game: Competition,
  tipps: BetEntity[],
  users: UserEntity[],
) {
  const score0 = parseInt(game.competitors[0].score, 10);
  const score1 = parseInt(game.competitors[1].score, 10);
  const correctDiff = Math.abs(score0 - score1);
  const winner = getWinner(game.competitors);

  return tipps.map((t) => ({
    user: users.find((u) => u.email === t.user.email)?.name || t.user.email,
    points:
      t.winner === winner ? 1 + calcBonus(correctDiff, winner, t, tipps) : 0,
  }));
}
