import { env } from "process";

import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";

import { UserDataService } from "../database/user.service";
import { User } from "../user.decorator";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private userDataService: UserDataService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.JWT_SECRET,
    });
  }

  async validate(payload: User) {
    const user = await this.userDataService.findOne(payload.id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
