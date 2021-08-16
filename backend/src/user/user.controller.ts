import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

import { getTransporter } from '../email';

import { UserDataService } from '../database/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly databaseService: UserDataService) {}

  @UseGuards(ThrottlerGuard)
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<boolean> {
    return this.databaseService.login(email, password);
  }

  @Post('logout')
  async logout() {}

  @UseGuards(ThrottlerGuard)
  @Throttle(3, 60)
  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('password') password: string,
  ): Promise<void> {
    const [id, token] = await this.databaseService.createUser(
      email,
      name,
      password,
    );
    const transporter = await getTransporter();
    await transporter
      .sendMail({
        from: 'tippspiel@6v4.de',
        to: email,
        subject: 'Bitte verifiziere deinen neuen Tippspiel Account',
        text: `
Hallo ${name},

du hast gerade einen Account auf https://6v4.de/tippspiel erstellt.
Bitte verifiziere deinen Account indem du auf den unten stehenden Link klickst.

https://6v4.de/tippspiel/#/verify?id=${id}&token=${token}

Viel Glück für die Tippsaison!



Wenn du keine weiteren Emails von 6v4.de erhalten möchtest, kontaktiere bitte admin@6v4.de
`,
      })
      .catch((error) => console.error(error));
  }

  @UseGuards(ThrottlerGuard)
  @Post('verify')
  async verify(
    @Body('id') id: number,
    @Body('token') token: string,
  ): Promise<void> {
    await this.databaseService.verify(id, token);
  }

  @UseGuards(ThrottlerGuard)
  @Post('request-reset')
  async requestReset(@Body('email') email: string): Promise<void> {
    const reset = await this.databaseService.sendReset(email);
    if (reset) {
      const { user, token } = reset;
      const transporter = await getTransporter();
      await transporter
        .sendMail({
          from: 'tippspiel@6v4.de',
          to: email,
          subject: 'Tippspiel Passwort zurücksetzen',
          text: `
Hallo ${user.name},

du hast dein Passwort vergessen.
Erstelle ein neues Passwort indem du den unten stehenden Link öffnest.

https://6v4.de/tippspiel/#/reset?id=${user.id}&token=${token}




Wenn du keine weiteren Emails von 6v4.de erhalten möchtest oder du diese Mail nicht angefordert hast, kontaktiere bitte admin@6v4.de
`,
        })
        .catch((error) => console.error(error));
    }
  }

  @UseGuards(ThrottlerGuard)
  @Throttle(1, 60)
  @Post('reset')
  async reset(
    @Body('id') id: number,
    @Body('token') token: string,
    @Body('password') password: string,
  ): Promise<void> {
    return this.databaseService.resetPassword(id, password, token);
  }

  @Post('edit')
  async editUser(): Promise<void> {}
}
