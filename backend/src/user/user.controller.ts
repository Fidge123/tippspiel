import { Controller, Post, Body } from '@nestjs/common';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.userService.login(email, password);
  }

  @Post('logout')
  async logout() {}

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('password') password: string,
  ): Promise<any> {
    return await this.userService.createUser(email, name, password);
  }

  @Post('edit')
  async editUser() {}
}
