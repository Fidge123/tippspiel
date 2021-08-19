import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { BetDataService } from '../database/bet.service';
import { getTransporter } from '../email';

@Injectable()
export class BetService {
  constructor(private readonly databaseService: BetDataService) {}

  @Cron('0 9,19 * * *')
  async importTeams(): Promise<void> {
    const users = await this.databaseService.findAllUsers();
    for (const user of users) {
      const games = await this.databaseService.findGamesWithoutBets(user.id);
      if (games.length) {
        console.log('Found', games.length, 'games without bets for', user.name);
        const transporter = await getTransporter();
        await transporter
          .sendMail({
            from: 'tippspiel@6v4.de',
            to: user.email,
            subject: `Du hast ${games.length} Spiele noch nicht getippt.`,
            text: `
Hallo ${user.name},

du hast folgende Spiele noch nicht getippt:
${games
  .map(
    (game) =>
      `  - ${game.awayTeam.name} @ ${
        game.homeTeam.name
      } (${game.date.toLocaleString()})`,
  )
  .join('\n')}

Tippe die Spiele hier: https://6v4.de/tippspiel


Wenn du keine weiteren Emails von 6v4.de erhalten möchtest, kontaktiere bitte admin@6v4.de
`,
          })
          .catch((error) => console.error(error));
      }
    }
  }
}
