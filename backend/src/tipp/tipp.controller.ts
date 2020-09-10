import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../permissions.decorator';
import { PermissionsGuard } from '../permissions.guard';
import { CurrentUser, User } from '../user.decorator';

import { TippService } from './tipp.service';
import { Tipp } from './tipp.entity';
import { CreateTippDto } from './tipp.dto';

@Controller('tipp')
export class TippController {
  constructor(private readonly tippService: TippService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get()
  @Permissions('read:tipp')
  async getAll(): Promise<Tipp[]> {
    return this.tippService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post()
  @Permissions('write:tipp')
  async setTipp(
    @Body() createTipp: CreateTippDto,
    @CurrentUser() user: User,
  ): Promise<Tipp> {
    console.log(JSON.stringify(user));
    return this.tippService.update(createTipp, user.email);
  }
}
