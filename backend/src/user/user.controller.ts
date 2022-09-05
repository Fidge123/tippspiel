import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

import { loadHTML, loadTXT } from '../templates/loadTemplate';
import { getTransporter } from '../email';

import { UserDataService } from '../database/user.service';
import { AuthService } from '../auth/auth.service';
import { HiddenDto } from './hidden.dto';
import { CurrentUser, User } from '../user.decorator';
import { UserEntity } from 'src/database/entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('user')
export class UserController {
  constructor(
    private readonly databaseService: UserDataService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard('local'), ThrottlerGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser, @Res() res: Response) {
    const { access_token, refresh_token } = await this.authService.login(
      req.user,
    );
    res.cookie('refreshToken', refresh_token, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 29 * 24 * 60 * 60 * 10000, // 29 days
    });
    return res.json(access_token);
  }

  @UseGuards(AuthGuard('jwt'), ThrottlerGuard)
  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
  }

  @UseGuards(AuthGuard('refresh'), ThrottlerGuard)
  @Post('refresh')
  async refresh(@Req() req: RequestWithUser, @Res() res: Response) {
    const { access_token, refresh_token } = await this.authService.login(
      req.user,
    );
    res.cookie('refreshToken', refresh_token, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 29 * 24 * 60 * 60 * 10000, // 29 days
    });
    return res.json(access_token);
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
    const link = `https://nfl-tippspiel.de/tippspiel/verify?id=${id}&token=${token}`;
    const transporter = await getTransporter();
    await transporter
      .sendEmail({
        From: 'Tippspiel <tippspiel@6v4.de>',
        To: process.env.EMAIL,
        Subject: 'Neuer Nutzer registriert',
        TextBody: await loadTXT('newUserAlert'),
        HtmlBody: await loadHTML('newUserAlert', {
          id,
          time: now.toLocaleString(),
        }),
      })
      .catch((error) => console.error(error));
    await transporter
      .sendEmail({
        From: 'Tippspiel <tippspiel@6v4.de>',
        To: email,
        Subject: 'Bitte verifiziere deinen neuen Tippspiel Account',
        TextBody: await loadTXT('verifyUser', { name, link }),
        HtmlBody: await loadHTML('verifyUser', { name, link }),
      })
      .catch((error) => console.error(error));
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change/name')
  async changeName(
    @Body('name') name: string,
    @CurrentUser() user: User,
  ): Promise<UserEntity> {
    return await this.databaseService.renameUser(user.id, name);
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
      .sendEmail({
        From: 'Tippspiel <tippspiel@6v4.de>',
        To: process.env.EMAIL,
        Subject: 'Nutzer verifiziert',
        TextBody: await loadTXT('userVerifiedAlert'),
        HtmlBody: await loadHTML('userVerifiedAlert', {
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
      const link = `https://nfl-tippspiel.de/tippspiel/reset?id=${user.id}&token=${token}`;
      const transporter = await getTransporter();
      await transporter
        .sendEmail({
          From: 'Tippspiel <tippspiel@6v4.de>',
          To: process.env.EMAIL,
          Subject: 'Passwort Reset angefragt',
          TextBody: await loadTXT('passwordResetAlert'),
          HtmlBody: await loadHTML('passwordResetAlert', {
            id: user.id,
            time: now.toLocaleString(),
          }),
        })
        .catch((error) => console.error(error));
      await transporter
        .sendEmail({
          From: 'Tippspiel <tippspiel@6v4.de>',
          To: email,
          Subject: 'Tippspiel Passwort zurücksetzen',
          TextBody: await loadTXT('passwordReset', { name: user.name, link }),
          HtmlBody: await loadHTML('passwordReset', { name: user.name, link }),
        })
        .catch((error) => console.error(error));
    }
  }

  @UseGuards(ThrottlerGuard)
  @Throttle(1, 60)
  @Post('reset')
  async reset(
    @Body('id') id: string,
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

  @UseGuards(AuthGuard('jwt'))
  @Get('settings')
  async getSettings(@CurrentUser() user: User): Promise<void> {
    const u = await this.databaseService.getSettings(user.id);
    return u.settings;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('hidden')
  async setHidden(
    @Body() hidden: HiddenDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.databaseService.setHidden(
      user.id,
      hidden.weekId,
      hidden.hidden,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('hidden/default')
  async setHideByDefault(
    @Body('hideByDefault') hideByDefault: boolean,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.databaseService.setHideByDefault(user.id, hideByDefault);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('league')
  async setActiveLeague(
    @Body('league') league: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.databaseService.setActiveLeague(user.id, league);
  }
}
