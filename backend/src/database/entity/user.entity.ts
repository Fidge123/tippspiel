import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { BetEntity } from './bet.entity';
import { BetDoublerEntity } from './betDoubler.entity';
import { DivisionBetEntity } from './divisionBet.entity';
import { LeagueEntity } from './league.entity';
import { ResetEntity } from './reset.entity';
import { SuperbowlBetEntity } from './superbowlBet.entity';
import { VerifyEntity } from './verify.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ select: false })
  salt: string;

  @Column()
  name: string;

  @Column('jsonb')
  settings: any;

  @ManyToMany(() => LeagueEntity, (league) => league.members)
  memberIn: LeagueEntity[];

  @ManyToMany(() => LeagueEntity, (league) => league.admins)
  adminIn: LeagueEntity[];

  @OneToMany(() => BetEntity, (bet) => bet.user)
  bets: BetEntity[];

  @OneToMany(() => DivisionBetEntity, (bet) => bet.user)
  divisionBets: DivisionBetEntity[];

  @OneToMany(() => SuperbowlBetEntity, (bet) => bet.user)
  superbowlBets: SuperbowlBetEntity[];

  @OneToMany(() => BetDoublerEntity, (doubler) => doubler.user)
  doubler: BetDoublerEntity[];

  @OneToMany(() => ResetEntity, (reset) => reset.user)
  resetTokens: ResetEntity[];

  @OneToMany(() => VerifyEntity, (verify) => verify.user)
  verifyTokens: VerifyEntity[];

  @Column({ default: false })
  verified: boolean;

  @Column({ select: false })
  consentedAt: Date;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
