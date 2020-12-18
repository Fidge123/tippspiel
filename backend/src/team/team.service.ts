import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepo: Repository<Team>,
  ) {}

  async findAll(): Promise<Team[]> {
    return this.teamRepo.find();
  }
}
