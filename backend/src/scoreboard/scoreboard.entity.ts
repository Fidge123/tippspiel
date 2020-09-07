import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Scoreboard } from './scoreboard.type';

@Entity({ name: 'scoreboard' })
export class ScoreboardEntity {
  @PrimaryColumn()
  dates: number;

  @PrimaryColumn()
  seasontype: number;

  @PrimaryColumn()
  week: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('jsonb')
  response: Scoreboard;
}
