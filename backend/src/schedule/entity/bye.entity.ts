import { Entity, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { WeekEntity } from './week.entity';
import { TeamEntity } from './team.entity';

@Entity({ name: 'bye' })
export class ByeEntity {
  @ManyToOne(() => WeekEntity, (week) => week.byes, { primary: true })
  week: WeekEntity;

  @ManyToOne(() => TeamEntity, (team) => team.byes, { primary: true })
  team: TeamEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
