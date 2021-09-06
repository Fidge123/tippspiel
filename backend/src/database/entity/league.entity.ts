import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  UpdateDateColumn,
  CreateDateColumn,
  JoinTable,
} from 'typeorm';
import { BetEntity } from './bet.entity';
import { UserEntity } from './user.entity';

@Entity('league')
export class LeagueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => UserEntity, (user) => user.memberIn)
  @JoinTable({ name: 'member' })
  members: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.adminIn)
  @JoinTable({ name: 'admin' })
  admins: UserEntity[];

  @OneToMany(() => BetEntity, (bet) => bet.league)
  bets: BetEntity[];

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
