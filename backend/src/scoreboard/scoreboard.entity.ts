import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { Scoreboard as SB } from './scoreboard.type';

@Entity()
export class Scoreboard {
  @PrimaryColumn()
  url: string;

  @CreateDateColumn()
  date: Date;

  @Column('jsonb')
  response: SB;
}
