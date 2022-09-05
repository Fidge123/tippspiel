import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WeekEntity } from './week.entity';
import { TeamEntity } from './team.entity';

@Entity({ name: 'bye' })
export class ByeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WeekEntity, (week) => week.byes, { nullable: false })
  week: WeekEntity;

  @ManyToOne(() => TeamEntity, (team) => team.byes, { nullable: false })
  team: TeamEntity;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
