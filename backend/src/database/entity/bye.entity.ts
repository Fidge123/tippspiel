import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { WeekEntity } from './week.entity';
import { TeamEntity } from './team.entity';

@Entity({ name: 'bye' })
export class ByeEntity {
  @PrimaryColumn()
  teamId: string;

  @PrimaryColumn({ type: 'int4' })
  weekWeek: number;

  @PrimaryColumn({ type: 'int4' })
  weekYear: number;

  @PrimaryColumn({ type: 'int4' })
  weekSeasontype: number;

  @ManyToOne(() => WeekEntity, (week) => week.byes)
  week: WeekEntity;

  @ManyToOne(() => TeamEntity, (team) => team.byes)
  team: TeamEntity;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
