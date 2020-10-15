import { Controller, Get, Post, Query, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../permissions.decorator';
import { PermissionsGuard } from '../permissions.guard';

import { ScoreboardService } from './scoreboard.service';
import { Scoreboard, Competitors } from './scoreboard.type';
import { UpdateScoreboard } from './scoreboard.dto';

@Controller('scoreboard')
export class ScoreboardController {
  constructor(private readonly sbService: ScoreboardService) {}

  @Get(':season')
  async getAll(@Param('season') season: string): Promise<any[]> {
    const weeks = await this.sbService.findAll();
    return weeks
      .filter(({ dates }) => dates.toString() === season.toString())
      .map(({ seasontype, week, response }) => {
        const { label, startDate, endDate } = response.leagues[0].calendar
          .find(c => c.value === seasontype.toString())
          .entries.find(w => w.value === week.toString());
        const games = response.events
          .map(event => {
            const { home, away } = getCompetitor(
              event.competitions[0].competitors,
            );
            return {
              id: event.competitions[0].id,
              date: new Date(event.competitions[0].date),
              status: event.competitions[0].status.type.name,
              home: {
                name: home.team.displayName,
                shortName: home.team.abbreviation,
                logo: home.team.logo,
                color: home.team.color,
                color2: home.team.alternateColor,
                score: home.score,
              },
              away: {
                name: away.team.displayName,
                shortName: away.team.abbreviation,
                logo: away.team.logo,
                color: away.team.color,
                color2: away.team.alternateColor,
                score: away.score,
              },
            };
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        return {
          id: week,
          seasontype,
          label,
          teamsOnBye: response.week.teamsOnBye?.map(t => t.displayName) || [],
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          games,
        };
      })
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post()
  @Permissions('write:schedule')
  async load(
    @Query() { season, type, week }: UpdateScoreboard,
  ): Promise<Scoreboard> {
    return this.sbService.update(season || 2020, type || 2, week);
  }
}

function getCompetitor(competitors: Competitors[]) {
  return {
    home: competitors.find(c => c.homeAway === 'home'),
    away: competitors.find(c => c.homeAway === 'away'),
  };
}
