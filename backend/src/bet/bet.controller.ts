import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../permissions.decorator';
import { PermissionsGuard } from '../permissions.guard';
import { CurrentUser, User } from '../user.decorator';

import { BetDataService } from '../database/bet.service';
import { BetEntity } from '../database/entity';
import { CreateBetDto } from './bet.dto';

@Controller('bet')
export class BetController {
  constructor(private readonly databaseService: BetDataService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get()
  @Permissions('read:bet')
  async getAll(@CurrentUser() user: User): Promise<any> {
    const tipps = await this.databaseService.findUser(user.email);
    const counts = await this.databaseService.votesPerGame();
    return counts.reduce(
      (response: any, count: any) => ({
        ...response,
        [count.game]: {
          ...response[count.game],
          votes: {
            ...response[count.game]?.votes,
            [count.winner]: parseInt(count.count, 10),
          },
          selected:
            response[count.game]?.selected ||
            tipps.find((t) => t.game === count.game)?.winner,
          points:
            response[count.game]?.points ||
            tipps.find((t) => t.game === count.game)?.pointDiff,
        },
      }),
      {},
    );
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post()
  @Permissions('write:bet')
  async setTipp(
    @Body() createTipp: CreateBetDto,
    @CurrentUser() user: User,
  ): Promise<BetEntity> {
    return this.databaseService.update(createTipp, user.email);
  }
}
