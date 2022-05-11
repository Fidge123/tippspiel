import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { TeamEntity } from "../database/entity";
import { ScheduleDataService } from "../database/schedule.service";

@Controller("team")
export class TeamController {
  constructor(private readonly databaseService: ScheduleDataService) {}

  @UseGuards(AuthGuard("jwt"))
  @Get()
  async getAll(): Promise<TeamEntity[]> {
    return await this.databaseService.getTeams();
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id")
  async getOne(@Param("id") id: string): Promise<TeamEntity> {
    return await this.databaseService.getTeam(id);
  }
}
