import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DivisionBetEntity } from './divisionBet.entity';
import { TeamEntity } from './team.entity';

@Entity('division')
export class DivisionEntity {
  @PrimaryColumn()
  name: string;

  @OneToMany(() => TeamEntity, (team) => team.division)
  teams: TeamEntity[];

  @OneToMany(() => DivisionBetEntity, (bet) => bet.division)
  bets: DivisionBetEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
