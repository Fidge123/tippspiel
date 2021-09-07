import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Column,
} from 'typeorm';
import { TeamEntity } from './team.entity';
import { LeagueEntity } from './league.entity';
import { UserEntity } from './user.entity';
import { DivisionEntity } from './division.entity';

@Entity('divisionBet')
export class DivisionBetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DivisionEntity, (division) => division.bets)
  division: DivisionEntity;

  @ManyToOne(() => TeamEntity, (team) => team.divisionBets)
  team: TeamEntity;

  @Column()
  year: number;

  @ManyToOne(() => UserEntity, (user) => user.divisionBets)
  user: UserEntity;

  @ManyToOne(() => LeagueEntity, (league) => league.divisionBets)
  league: LeagueEntity;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
