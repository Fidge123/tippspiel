import { Controller, Get, Query } from '@nestjs/common';

import { GetGames } from './game.dto';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly sbService: GameService) {}

  @Get()
  async getAll(@Query() query: GetGames): Promise<any[]> {
    const games = await this.sbService.findGamesByWeek(
      query.type || 2,
      query.season || 2020,
      query.week,
    );
    return games.map((game) => ({
      completed: game.completed,
      home: {
        name: game.home,
        score: game.scoreHome,
        winner: game.winner === 'home',
      },
      away: {
        name: game.away,
        score: game.scoreAway,
        winner: game.winner === 'away',
      },
    }));
  }
}
