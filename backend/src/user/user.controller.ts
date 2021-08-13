import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(ThrottlerGuard)
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<boolean> {
    return this.userService.login(email, password);
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
    await this.userService.createUser(email, name, password);
  }

  @UseGuards(ThrottlerGuard)
  @Post('verify')
  async verify(
    @Body('id') id: number,
    @Body('token') token: string,
  ): Promise<void> {
    await this.userService.verify(id, token);
  }

  @UseGuards(ThrottlerGuard)
  @Post('request-reset')
  async requestReset(@Body('email') email: string): Promise<void> {
    await this.userService.sendReset(email);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle(1, 60)
  @Post('reset')
  async reset(
    @Body('id') id: number,
    @Body('token') token: string,
    @Body('password') password: string,
  ): Promise<void> {
    await this.userService.resetPassword(id, password, token);
  }

  @Post('edit')
  async editUser(): Promise<void> {}
}
