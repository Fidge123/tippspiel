import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  UserEntity,
  LeagueEntity,
  BetDoublerEntity,
  BetEntity,
  DivisionBetEntity,
  SuperbowlBetEntity,
} from './entity';

@Injectable()
export class LeagueDataService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(LeagueEntity)
    private leagueRepo: Repository<LeagueEntity>,
    @InjectRepository(BetDoublerEntity)
    private betDoublerRepo: Repository<BetDoublerEntity>,
    @InjectRepository(BetEntity)
    private betRepo: Repository<BetEntity>,
    @InjectRepository(DivisionBetEntity)
    private divBetRepo: Repository<DivisionBetEntity>,
    @InjectRepository(SuperbowlBetEntity)
    private sbBetRepo: Repository<SuperbowlBetEntity>,
  ) {}

  async getAllLeagues(): Promise<LeagueEntity[]> {
    return this.leagueRepo.find({ relations: { members: true, admins: true } });
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
    return this.leagueRepo.findOne({
      where: { id: leagueId },
      relations: { members: true, admins: true },
    });
  }

  async createLeague(name: string, userId: string): Promise<LeagueEntity> {
    const user = await this.userRepo
      .findOneByOrFail({ id: userId })
      .catch(() => {
        throw new NotFoundException('No user for this email found');
      });

    if (user) {
      const league = new LeagueEntity();
      league.name = name;
      league.season = 2024;
      league.members = [user];
      league.admins = [user];
      return this.leagueRepo.save(league);
    }
  }

  async removeLeague(leagueId: string, adminId: string): Promise<any> {
    const league = await this.leagueRepo.findOne({
      where: { id: leagueId },
      relations: { admins: true },
    });

    if (!league.admins.some((a) => a.id === adminId)) {
      throw new ForbiddenException('You need to be admin to delete the league');
    }

    if (league) {
      const doublers = await this.betDoublerRepo.delete({ league });
      console.log(
        `Deleted ${doublers.affected} doublers related to ${league.name}`,
      );
      const bets = await this.betRepo.delete({ league });
      console.log(`Deleted ${bets.affected} bets related to ${league.name}`);
      const divBets = await this.divBetRepo.delete({ league });
      console.log(
        `Deleted ${divBets.affected} div bets related to ${league.name}`,
      );
      const sbBets = await this.sbBetRepo.delete({ league });
      console.log(
        `Deleted ${sbBets.affected} sb bets related to ${league.name}`,
      );
      return this.leagueRepo.delete(leagueId);
    }
  }

  async changeLeagueName(
    name: string,
    leagueId: string,
    adminId: string,
  ): Promise<LeagueEntity> {
    const league = await this.leagueRepo.findOne({
      where: { id: leagueId },
      relations: { admins: true },
    });

    if (!league.admins.some((a) => a.id === adminId)) {
      throw new ForbiddenException('You need to be admin to add a user');
    }

    if (name.length < 3) {
      throw new BadRequestException(
        'Name needs to be at least 3 characters long',
      );
    }

    if (league && name) {
      league.name = name;
      return this.leagueRepo.save(league);
    }
  }

  async addAdmin(
    leagueId: string,
    userId: string,
    adminId: string,
  ): Promise<LeagueEntity> {
    const [league, user] = await Promise.all([
      this.leagueRepo.findOne({
        where: { id: leagueId },
        relations: { members: true, admins: true },
      }),
      this.userRepo.findOneByOrFail({ id: userId }),
    ]);

    if (!user) {
      throw new NotFoundException('No user for this id found');
    }

    if (!league.admins.some((a) => a.id === adminId)) {
      throw new ForbiddenException('You need to be admin to add a user');
    }

    if (league.admins.some((a) => a.id === userId)) {
      throw new BadRequestException('User is already admin of this league');
    }

    if (!league.members.some((m) => m.id === userId)) {
      throw new BadRequestException('Only members can be made admins');
    }

    if (league && user) {
      league.admins = [...league.admins, user];
      return this.leagueRepo.save(league);
    }
  }

  async removeAdmin(leagueId: string, userId: string, adminId: string) {
    const [league, user] = await Promise.all([
      this.leagueRepo.findOne({
        where: { id: leagueId },
        relations: { members: true, admins: true },
      }),
      this.userRepo.findOneByOrFail({ id: userId }),
    ]);

    if (!user) {
      throw new NotFoundException('No user for this id found');
    }

    if (!league.admins.some((a) => a.id === adminId)) {
      throw new ForbiddenException('You need to be admin to remove a user');
    }

    if (!league.admins.some((m) => m.id === user.id)) {
      throw new BadRequestException('User is not an admin of this league');
    }

    if (league.admins.filter((admin) => admin.id !== user.id).length < 1) {
      throw new BadRequestException('Cant remove all admins');
    }

    if (league && user) {
      league.admins = league.admins.filter((admin) => admin.id !== user.id);
      return this.leagueRepo.save(league);
    }
  }

  async addMember(leagueId: string, email: string, adminId: string) {
    if (!leagueId || !email) {
      throw new BadRequestException();
    }

    const [league, user] = await Promise.all([
      this.leagueRepo.findOne({
        where: { id: leagueId },
        relations: { members: true, admins: true },
      }),
      this.userRepo.findOneByOrFail({ email }).catch(() => {
        throw new NotFoundException('No user for this id found');
      }),
    ]);

    if (!league.admins.some((a) => a.id === adminId)) {
      throw new ForbiddenException('You need to be admin to add a user');
    }

    if (league.members.some((m) => m.id === user.id)) {
      throw new BadRequestException('User is already member of this league');
    }

    if (league && user) {
      league.members = [...league.members, user];
      return this.leagueRepo.save(league);
    }
  }

  async removeMember(leagueId: string, userId: string, adminId: string) {
    const [league, user] = await Promise.all([
      this.leagueRepo.findOne({
        where: { id: leagueId },
        relations: { members: true, admins: true },
      }),
      this.userRepo.findOneByOrFail({ id: userId }),
    ]);

    if (!user) {
      throw new NotFoundException('No user for this id found');
    }

    if (!league.admins.some((a) => a.id === adminId)) {
      throw new ForbiddenException('You need to be admin to remove a user');
    }

    if (!league.members.some((m) => m.id === user.id)) {
      throw new BadRequestException('User is not a member of this league');
    }

    if (league.members.filter((admin) => admin.id !== user.id).length < 1) {
      throw new BadRequestException('Cant remove all admins');
    }

    if (league.members.filter((member) => member.id !== user.id).length < 1) {
      throw new BadRequestException('Cant remove all members');
    }

    if (league && user) {
      // TODO what happens to the votes?
      league.admins = league.admins.filter((admin) => admin.id !== user.id);
      league.members = league.members.filter((member) => member.id !== user.id);
      return this.leagueRepo.save(league);
    }
  }

  // async deleteLeague(leagueId: string) {}
}
