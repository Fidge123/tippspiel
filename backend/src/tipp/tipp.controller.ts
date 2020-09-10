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
  async getAll(@CurrentUser() user: User): Promise<any> {
    const tipps = await this.tippService.findAll(user.email);
    const counts = await this.tippService.votesPerGame();
    return counts.reduce(
      (response: any, count: any) => ({
        ...response,
        [count.game]: {
          votes: {
            [count.winner]: count.count,
          },
          selected:
            response[count.game]?.selected ||
            tipps.find(t => t.game === count.game)?.winner,
          points:
            response[count.game]?.points ||
            tipps.find(t => t.game === count.game)?.pointDiff,
        },
      }),
      {},
    );
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post()
  @Permissions('write:tipp')
  async setTipp(
    @Body() createTipp: CreateTippDto,
    @CurrentUser() user: User,
  ): Promise<Tipp> {
    return this.tippService.update(createTipp, user.email);
  }
}
