import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../permissions.decorator';
import { PermissionsGuard } from '../permissions.guard';

import { TippService } from './tipp.service';
import { ScoreboardService } from 'src/scoreboard/scoreboard.service';
import { UserService } from 'src/user/user.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly tippService: TippService,
    private readonly userService: UserService,
    private readonly sbService: ScoreboardService,
  ) {}

  // @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(':season')
  // @Permissions('read:tipp')
  async getAll(@Param('season') season: string): Promise<any> {
    const games = await this.sbService.findFinished(parseInt(season, 10));
    const users = await this.userService.findAll();
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
      const points = tipps
        .sort((a, b) => {
          if (a.winner === winner) {
            return (
              Math.abs(a.pointDiff - pointDiff) -
              Math.abs(b.pointDiff - pointDiff)
            );
          } else {
            return 1;
          }
        })
        .map((t, i) => ({
          winner: t.winner,
          user: users.find(u => u.email === t.user)?.name || t.user,
          pointDiff: Math.abs(t.pointDiff - pointDiff),
          points: t.winner === winner ? 1 + Math.max(3 - i, 0) : 0,
        }));

      points.forEach((c, i) => {
        const p =
          i > 0 && c.points > 0 && c.pointDiff === points[i - 1].pointDiff
            ? points[i - 1].points
            : c.points;
        lb[c.user] = { ...lb[c.user], [game.id]: p };
      });

      return lb;
    }, {} as any);
  }
}
