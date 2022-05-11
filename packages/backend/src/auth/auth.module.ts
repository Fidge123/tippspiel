import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

import { DatabaseModule } from "../database/database.module";

import { AuthService } from "./auth.service";
import { LocalStrategy } from "./local.strategy";
import { JwtStrategy } from "./jwt.strategy";
import { RefreshStrategy } from "./refresh.strategy";

@Module({
  imports: [DatabaseModule, PassportModule, JwtModule.register({})],
  providers: [JwtStrategy, RefreshStrategy, LocalStrategy, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
