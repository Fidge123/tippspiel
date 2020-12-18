import { Controller, Get, Param } from '@nestjs/common';

import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly sbService: GameService) {}

  @Get(':season')
  async getAll(@Param('season') season: string): Promise<any[]> {
    const games = await this.sbService.findAll(parseInt(season));
    return games
      .map(({ date, status, home, away, scoreHome, scoreAway, winner }) => {
        return {
          date,
          status,
          winner,
          home: {
            name: home,
            // record: home.records?.find((r) => r.type === 'total')?.summary,
            score: scoreHome,
          },
          away: {
            name: away,
            // record: away.records?.find((r) => r.type === 'total')?.summary,
            score: scoreAway,
          },
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
