import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Leaderboard {
  @PrimaryColumn()
  email: string;

  @PrimaryColumn()
  league: string;

  @Column()
  name: string;

  @Column()
  points: number;

  @Column()
  correctBets: number;

  @Column()
  totalBets: number;

  // @Column()
  // threeXP: number;

  // @Column()
  // twoXP: number;

  // @Column()
  // oneXP: number;

  // @Column()
  // distance: number;

  // @Column()
  // absoluteBestTeam: string;

  // @Column()
  // averageBestTeam: string;

  // @Column()
  // absoluteWorstTeam: string;

  // @Column()
  // averageWorstTeam: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
