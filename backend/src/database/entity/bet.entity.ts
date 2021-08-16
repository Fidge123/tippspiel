import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { GameEntity } from './game.entity';
import { UserEntity } from './user.entity';

@Entity('bet')
export class BetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.bets)
  user: UserEntity;

  @ManyToOne(() => GameEntity, (game) => game.bets)
  game: GameEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  winner: string;

  @Column()
  pointDiff: number;
}
