import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ByeEntity } from './bye.entity';
import { GameEntity } from './game.entity';

@Entity({ name: 'week' })
export class WeekEntity {
  @PrimaryColumn()
  year: number;

  @PrimaryColumn()
  seasontype: number;

  @PrimaryColumn()
  week: number;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column()
  label: string;

  @OneToMany(() => GameEntity, (game) => game.week)
  games: GameEntity[];

  @OneToMany(() => ByeEntity, (bye) => bye.week)
  byes: ByeEntity[];

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
