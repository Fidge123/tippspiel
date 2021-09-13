import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { loadHTML, loadTXT } from 'src/templates/loadTemplate';

import { BetDataService } from '../database/bet.service';
import { getTransporter } from '../email';

@Injectable()
export class BetService {
  constructor(private readonly databaseService: BetDataService) {}

  @Cron('0 9,19 * * *')
  async betReminder(): Promise<void> {
    const users = await this.databaseService.findAllUsers();
    for (const user of users) {
      const games = await this.databaseService.findGamesWithoutBets(user.id);
      if (games.length) {
        console.log('Found', games.length, 'games without bets for', user.name);
        const transporter = await getTransporter();
        await transporter
          .sendMail({
            from: {
              name: 'Tippspiel',
              address: 'tippspiel@6v4.de',
            },
            to: user.email,
            subject: `Du hast ${games.length} Spiele noch nicht getippt`,
            text: await loadTXT('betReminder', {
              name: user.name,
              list: games
                .map(
                  (game) =>
                    `  - ${game.awayTeam.name} @ ${
                      game.homeTeam.name
                    } (${game.date.toLocaleString('de', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })})`,
                )
                .join('\n'),
              html: await loadHTML('betReminder', {
                name: user.name,
                list: games
                  .map(
                    (game) =>
                      `    <li>${game.awayTeam.name} @ ${
                        game.homeTeam.name
                      } (${game.date.toLocaleString('de', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })})</li>`,
                  )
                  .join('\n'),
              }),
            }),
          })
          .catch((error) => console.error(error));
      }
    }
  }
}
