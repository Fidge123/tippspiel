import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../permissions.decorator';
import { PermissionsGuard } from '../permissions.guard';

import { TippService } from './tipp.service';
import { ScoreboardService } from 'src/scoreboard/scoreboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly tippService: TippService,
    private readonly sbService: ScoreboardService,
  ) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(':season')
  @Permissions('read:tipp')
  async getAll(@Param('season') season: string): Promise<any> {
    const games = await this.sbService.findFinished(parseInt(season, 10));
    return games.reduce(async (lb, game) => {
      const tipps = await this.tippService.findGame(game.id);
      const winner =
        parseInt(game.competitors[0].score, 10) >
        parseInt(game.competitors[1].score, 10)
          ? game.competitors[0].homeAway
          : game.competitors[1].homeAway;
      const pointDiff =
        parseInt(game.competitors[0].score, 10) -
        parseInt(game.competitors[1].score, 10);
      const correct = tipps
        .filter(t => t.winner === winner)
        .sort(
          (a, b) =>
            Math.abs(a.pointDiff - pointDiff) -
            Math.abs(b.pointDiff - pointDiff),
        );
      const incorrect = tipps.filter(t => t.winner !== winner);

      let prev: any;
      correct.forEach((t, i) => {
        lb[t.user] = lb[t.user] || {};
        lb[t.user][game.id] = 1 + Math.max(3 - i, 0);
        const temp = {
          points: lb[t.user][game.id],
          diff: Math.abs(t.pointDiff - pointDiff),
        };
        if (prev && prev.diff === temp.diff) {
          lb[t.user][game.id] = lb[correct[i - 1].user][game.id];
        }
        prev = temp;
      });
      incorrect.forEach(t => {
        lb[t.user] = lb[t.user] || {};
        lb[t.user][game.id] = 0;
      });
      return lb;
    }, {} as any);
  }
}
