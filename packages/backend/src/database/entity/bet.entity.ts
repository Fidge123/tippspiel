import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
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

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @Column()
  winner: string;

  @Column()
  pointDiff: number;
}
