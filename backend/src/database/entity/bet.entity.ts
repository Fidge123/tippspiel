import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinTable,
} from 'typeorm';
import { GameEntity } from './game.entity';
import { LeagueEntity } from './league.entity';
import { UserEntity } from './user.entity';

@Entity('bet')
export class BetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => GameEntity, (game) => game.bets)
  game: GameEntity;

  @ManyToOne(() => UserEntity, (user) => user.bets)
  user: UserEntity;

  @ManyToOne(() => LeagueEntity, (league) => league.bets)
  league: LeagueEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  winner: string;

  @Column()
  pointDiff: number;
}
