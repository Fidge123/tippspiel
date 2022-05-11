import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";

import { BetService } from "./bet.service";
import { BetController } from "./bet.controller";
import { LeaderboardController } from "./leaderboard.controller";

@Module({
  imports: [DatabaseModule],
  providers: [BetService],
  controllers: [BetController, LeaderboardController],
})
export class BetModule {}
