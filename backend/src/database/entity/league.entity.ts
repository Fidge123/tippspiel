import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  UpdateDateColumn,
  CreateDateColumn,
  JoinTable,
} from 'typeorm';
import { BetEntity } from './bet.entity';
import { BetDoublerEntity } from './betDoubler.entity';
import { DivisionBetEntity } from './divisionBet.entity';
import { SuperbowlBetEntity } from './superbowlBet.entity';
import { UserEntity } from './user.entity';

@Entity('league')
export class LeagueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int4' })
  season: number;

  @ManyToMany(() => UserEntity, (user) => user.memberIn, { cascade: true })
  @JoinTable({ name: 'member' })
  members: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.adminIn, { cascade: true })
  @JoinTable({ name: 'admin' })
  admins: UserEntity[];

  @OneToMany(() => BetEntity, (bet) => bet.league)
  bets: BetEntity[];

  @OneToMany(() => DivisionBetEntity, (bet) => bet.league)
  divisionBets: DivisionBetEntity[];

  @OneToMany(() => SuperbowlBetEntity, (bet) => bet.league)
  superbowlBets: SuperbowlBetEntity[];

  @OneToMany(() => BetDoublerEntity, (doubler) => doubler.league)
  doubler: BetDoublerEntity[];

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
