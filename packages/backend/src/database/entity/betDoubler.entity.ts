import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { GameEntity } from './game.entity';
import { WeekEntity } from './week.entity';
import { UserEntity } from './user.entity';
import { LeagueEntity } from './league.entity';

@Entity('betDoubler')
export class BetDoublerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => GameEntity, (game) => game.doubler)
  game: GameEntity;

  @ManyToOne(() => UserEntity, (user) => user.doubler)
  user: UserEntity;

  @ManyToOne(() => WeekEntity, (week) => week.doubler)
  week: WeekEntity;

  @ManyToOne(() => LeagueEntity, (league) => league.doubler)
  league: LeagueEntity;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
