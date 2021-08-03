import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { TeamEntity } from 'src/schedule/team.entity';
import { WeekEntity } from './week.entity';

@Entity({ name: 'game' })
export class GameEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  date: Date;

  @ManyToOne(() => WeekEntity, (week) => week.games)
  week: WeekEntity;

  @ManyToOne(() => TeamEntity, (team) => team.awayGames)
  awayTeam: TeamEntity;

  @ManyToOne(() => TeamEntity, (team) => team.homeGames)
  homeTeam: TeamEntity;

  @Column()
  awayScore: number;

  @Column()
  homeScore: number;

  @Column()
  winner: 'home' | 'away' | 'none';

  @Column()
  status: string;
  // | 'STATUS_SCHEDULED'
  // | 'STATUS_IN_PROGRESS'
  // | 'STATUS_FINAL'
  // | 'STATUS_CANCELED';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
