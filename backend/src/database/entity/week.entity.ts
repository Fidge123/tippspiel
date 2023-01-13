import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BetDoublerEntity } from './betDoubler.entity';
import { ByeEntity } from './bye.entity';
import { GameEntity } from './game.entity';

@Entity({ name: 'week' })
@Index(['year', 'seasontype', 'week'], { unique: true })
export class WeekEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'int4' })
  year: number;

  @Column({ type: 'int4' })
  seasontype: number;

  @Column({ type: 'int4' })
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

  @OneToMany(() => BetDoublerEntity, (doubler) => doubler.week)
  doubler: BetDoublerEntity[];

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
