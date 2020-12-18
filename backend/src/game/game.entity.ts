import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Game {
  @PrimaryColumn()
  week: string;

  @PrimaryColumn()
  year: string;

  @PrimaryColumn()
  home: string;

  @PrimaryColumn()
  away: string;

  @Column()
  date: Date;

  @Column()
  status: string;

  @Column()
  scoreHome: number;

  @Column()
  scoreAway: number;

  @Column()
  winner: 'home' | 'away';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
