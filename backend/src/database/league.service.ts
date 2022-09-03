import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity, LeagueEntity } from './entity';

@Injectable()
export class LeagueDataService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(LeagueEntity)
    private leagueRepo: Repository<LeagueEntity>,
  ) {}

  async getAllLeagues(): Promise<LeagueEntity[]> {
    return this.leagueRepo.find();
  }

  async getParticipatedLeagues(user: string): Promise<LeagueEntity[]> {
    return this.leagueRepo.find({
      select: {
        id: true,
        name: true,
        season: true,
        members: { id: true, name: true },
        admins: { id: true, name: true },
      },
      where: { members: { id: user } },
      relations: { members: true, admins: true },
    });
  }

  async getAdministeredLeague(user: string): Promise<LeagueEntity[]> {
    return this.leagueRepo.find({
      select: {
        id: true,
        name: true,
        season: true,
        members: { id: true, name: true },
        admins: { id: true, name: true },
      },
      where: { admins: { id: user } },
      relations: { members: true, admins: true },
    });
  }

  async getLeague(leagueId: string): Promise<LeagueEntity> {
    return this.leagueRepo.findOneBy({ id: leagueId });
  }

  async createLeague(name: string, userId: string): Promise<LeagueEntity> {
    const user = await this.userRepo.findOneByOrFail({ id: userId });

    if (user) {
      const league = new LeagueEntity();
      league.name = name;
      league.season = 2022;
      league.members = [user];
      league.admins = [user];
      return this.leagueRepo.save(league);
    }
  }

  async changeLeagueName(
    name: string,
    leagueId: string,
  ): Promise<LeagueEntity> {
    const league = await this.leagueRepo.findOneByOrFail({ id: leagueId });
    if (league) {
      league.name = name;
      return this.leagueRepo.save(league);
    }
  }

  async addAdmin(leagueId: string, userId: string): Promise<LeagueEntity> {
    const [league, user] = await Promise.all([
      this.leagueRepo.findOneByOrFail({ id: leagueId }),
      this.userRepo.findOneByOrFail({ id: userId }),
    ]);

    if (league && user) {
      league.admins = [...league.admins, user];
      return this.leagueRepo.save(league);
    }
  }

  async removeAdmin(leagueId: string, userId: string) {
    const [league, user] = await Promise.all([
      this.leagueRepo.findOneByOrFail({ id: leagueId }),
      this.userRepo.findOneByOrFail({ id: userId }),
    ]);

    if (league && user) {
      league.admins = league.admins.filter((admin) => admin.id !== user.id);
      return this.leagueRepo.save(league);
    }
  }

  async addMember(leagueId: string, userId: string) {
    const [league, user] = await Promise.all([
      this.leagueRepo.findOneByOrFail({ id: leagueId }),
      this.userRepo.findOneByOrFail({ id: userId }),
    ]);

    if (league && user) {
      league.members = [...league.members, user];
      return this.leagueRepo.save(league);
    }
  }

  async removeMember(leagueId: string, userId: string) {
    const [league, user] = await Promise.all([
      this.leagueRepo.findOneByOrFail({ id: leagueId }),
      this.userRepo.findOneByOrFail({ id: userId }),
    ]);

    if (league && user) {
      league.members = league.members.filter((admin) => admin.id !== user.id);
      return this.leagueRepo.save(league);
    }
  }

  // async deleteLeague(leagueId: string) {}
}
