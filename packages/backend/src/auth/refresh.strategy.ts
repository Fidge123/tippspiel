import { env } from 'process';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserDataService } from '../database/user.service';
import { User } from '../user.decorator';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private userDataService: UserDataService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refreshToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: env.REFRESH_SECRET,
    });
  }

  async validate(payload: User) {
    const user = await this.userDataService.findOne(payload.id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
