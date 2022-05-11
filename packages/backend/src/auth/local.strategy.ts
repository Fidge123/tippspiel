import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserDataService } from '../database/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userDataService: UserDataService) {
    super({ usernameField: 'email' });
  }

  async validate(username: string, password: string) {
    return await this.userDataService.login(username, password);
  }
}
