import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';

import { loadHTML, loadTXT } from '../templates/loadTemplate';
import { getTransporter } from '../email';

import { UserDataService } from '../database/user.service';
import { AuthService } from '../auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly databaseService: UserDataService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard('local'), ThrottlerGuard)
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle(3, 60)
  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('consent') consent: boolean,
    @Body('password') password: string,
  ): Promise<void> {
    if (password.length < 8) {
      throw new BadRequestException(
        'Password needs to be longer than 8 characters',
      );
    }
    const [id, token] = await this.databaseService.createUser(
      email,
      name,
      consent,
      password,
    );
    const now = new Date();
    const link = `https://6v4.de/tippspiel/#/verify?id=${id}&token=${token}`;
    const transporter = await getTransporter();
    await transporter
      .sendMail({
        from: {
          name: 'Tippspiel',
          address: 'tippspiel@6v4.de',
        },
        to: process.env.EMAIL,
        subject: 'Neuer Nutzer registriert',
        text: await loadTXT('newUserAlert'),
        html: await loadHTML('newUserAlert', {
          id,
          time: now.toLocaleString(),
        }),
      })
      .catch((error) => console.error(error));
    await transporter
      .sendMail({
        from: {
          name: 'Tippspiel',
          address: 'tippspiel@6v4.de',
        },
        to: email,
        subject: 'Bitte verifiziere deinen neuen Tippspiel Account',
        text: await loadTXT('verifyUser', { name, link }),
        html: await loadHTML('verifyUser', { name, link }),
      })
      .catch((error) => console.error(error));
  }

  @UseGuards(ThrottlerGuard)
  @Post('verify')
  async verify(
    @Body('id') id: string,
    @Body('token') token: string,
  ): Promise<void> {
    const now = new Date();

    const transporter = await getTransporter();
    await this.databaseService.verify(id, token);
    await transporter
      .sendMail({
        from: {
          name: 'Tippspiel',
          address: 'tippspiel@6v4.de',
        },
        to: process.env.EMAIL,
        subject: 'Nutzer verifiziert',
        text: await loadTXT('userVerifiedAlert'),
        html: await loadHTML('userVerifiedAlert', {
          id,
          time: now.toLocaleString(),
        }),
      })
      .catch((error) => console.error(error));
  }

  @UseGuards(ThrottlerGuard)
  @Post('request-reset')
  async requestReset(@Body('email') email: string): Promise<void> {
    const now = new Date();

    const reset = await this.databaseService.sendReset(email);
    if (reset) {
      const { user, token } = reset;
      const link = `https://6v4.de/tippspiel/#/reset?id=${user.id}&token=${token}`;
      const transporter = await getTransporter();
      await transporter
        .sendMail({
          from: {
            name: 'Tippspiel',
            address: 'tippspiel@6v4.de',
          },
          to: process.env.EMAIL,
          subject: 'Passwort Reset angefragt',
          text: await loadTXT('passwordResetAlert'),
          html: await loadHTML('passwordResetAlert', {
            id: user.id,
            time: now.toLocaleString(),
          }),
        })
        .catch((error) => console.error(error));
      await transporter
        .sendMail({
          from: {
            name: 'Tippspiel',
            address: 'tippspiel@6v4.de',
          },
          to: email,
          subject: 'Tippspiel Passwort zurücksetzen',
          text: await loadTXT('passwordReset', { name: user.name, link }),
          html: await loadHTML('passwordReset', { name: user.name, link }),
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
    if (password.length < 8) {
      throw new BadRequestException(
        'Password needs to be longer than 8 characters',
      );
    }
    return this.databaseService.resetPassword(id, password, token);
  }

  @Post('edit')
  async editUser(): Promise<void> {}
}
