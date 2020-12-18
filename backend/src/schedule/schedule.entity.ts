import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Schedule {
  @PrimaryColumn()
  seasontype: number;

  @PrimaryColumn()
  week: number;

  @PrimaryColumn()
  season: number;

  @PrimaryColumn()
  home: string;

  @PrimaryColumn()
  away: string;

  @Column()
  date: Date;

  // @Column()
  // status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
