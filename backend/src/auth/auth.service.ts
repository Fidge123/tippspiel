import { env } from 'process';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user.decorator';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login({ id, name, email }: User) {
    return {
      access_token: this.jwtService.sign(
        { id, name, email },
        {
          secret: env.JWT_SECRET,
          expiresIn: '15m',
        },
      ),
      refresh_token: this.jwtService.sign(
        { id, name, email },
        {
          secret: env.REFRESH_SECRET,
          expiresIn: '1y',
        },
      ),
    };
  }
}
