import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { ScoreboardService } from './scoreboard.service';
import { Scoreboard, Competitors } from './scoreboard.type';
import { UpdateScoreboard } from './scoreboard.dto';

@Controller('scoreboard')
export class ScoreboardController {
  constructor(private readonly sbService: ScoreboardService) {}

  @Get(':season')
  async getAll(@Param('season') season: string): Promise<any[]> {
    const weeks = await this.sbService.findAll();
    const games = weeks
      .filter(({ dates }) => dates.toString() === season.toString())
      .map(({ response }) =>
        response.events.map(event => {
          const { home, away } = getCompetitor(
            event.competitions[0].competitors,
          );
          return {
            date: new Date(event.competitions[0].date),
            status: event.competitions[0].status.type.name,
            home: {
              name: home.team.displayName,
              score: home.score,
            },
            away: {
              name: away.team.displayName,
              score: away.score,
            },
          };
        }),
      );
    return games;
  }

  @Post()
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
