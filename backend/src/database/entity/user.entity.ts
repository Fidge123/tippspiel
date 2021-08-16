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
import { LeagueEntity } from './league.entity';
import { ResetEntity } from './reset.entity';
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

  @ManyToMany(() => LeagueEntity, (league) => league.members)
  memberIn: LeagueEntity[];

  @ManyToMany(() => LeagueEntity, (league) => league.admins)
  adminIn: LeagueEntity[];

  @OneToMany(() => BetEntity, (bet) => bet.user)
  bets: BetEntity[];

  @OneToMany(() => ResetEntity, (reset) => reset.user)
  resetTokens: ResetEntity[];

  @OneToMany(() => VerifyEntity, (verify) => verify.user)
  verifyTokens: VerifyEntity[];

  @Column({ default: false })
  verified: boolean;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
