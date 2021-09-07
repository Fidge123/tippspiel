import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
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

  @ManyToOne(() => LeagueEntity, (league) => league.superbowlBets)
  league: LeagueEntity;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
