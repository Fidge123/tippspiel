import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { loadHTML, loadTXT } from '../templates/loadTemplate';

import { BetDataService } from '../database/bet.service';
import { getTransporter } from '../email';

@Injectable()
export class BetService {
  constructor(private readonly databaseService: BetDataService) {}

  @Cron('0 18 * Sep-Dec,Jan,Feb *')
  async betReminder(): Promise<void> {
    const users = await this.databaseService.findAllUsers();
    for (const user of users) {
      if (
        !(user.settings.sendReminder ?? true) ||
        !user.memberIn.some((l) => l.season === 2022)
      ) {
        console.log(`Skipped user ${user.name}`);
        continue;
      }
      const games = await this.databaseService.findGamesWithoutBets(user.id);
      if (games.length) {
        console.log('Found', games.length, 'games without bets for', user.name);
        const transporter = await getTransporter();
        const countString =
          games.length > 1 ? `${games.length} Spiele` : `ein Spiel`;
        await transporter
          .sendEmail({
            From: 'Tippspiel <tippspiel@6v4.de>',
            To: user.email,
            Subject: `Du hast ${countString} noch nicht getippt`,
            TextBody: await loadTXT('betReminder', {
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
            }),
            HtmlBody: await loadHTML('betReminder', {
              name: user.name,
              count: countString,
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
          })
          .catch((error) => console.error(error));
      }
    }
  }
}
