import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { BetEntity } from './bet.entity';
import { UserEntity } from './user.entity';

@Entity('reset')
export class LeagueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => UserEntity, (user) => user.memberIn)
  members: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.adminIn)
  admins: UserEntity[];

  @OneToMany(() => BetEntity, (bet) => bet.league)
  bets: BetEntity[];

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
