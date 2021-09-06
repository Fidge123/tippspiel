import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { TeamEntity } from './team.entity';
import { LeagueEntity } from './league.entity';
import { UserEntity } from './user.entity';
import { DivisionEntity } from '.';

@Entity('divisionBet')
export class DivisionBetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DivisionEntity, (division) => division.bets)
  division: DivisionEntity;

  @ManyToOne(() => TeamEntity, (team) => team.divisionBets)
  team: TeamEntity;

  @ManyToOne(() => UserEntity, (user) => user.bets)
  user: UserEntity;

  @ManyToOne(() => LeagueEntity, (league) => league.bets)
  league: LeagueEntity;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
