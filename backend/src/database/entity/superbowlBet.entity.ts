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

@Entity('superbowlBet')
export class SuperbowlBetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TeamEntity, (team) => team.superbowlBets)
  team: TeamEntity;

  @ManyToOne(() => UserEntity, (user) => user.superbowlBets)
  user: UserEntity;

  @Column({ type: 'int4' })
  year: number;

  @ManyToOne(() => LeagueEntity, (league) => league.superbowlBets)
  league: LeagueEntity;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
