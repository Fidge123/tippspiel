import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TeamEntity } from './team.entity';

@Entity('division')
export class DivisionEntity {
  @PrimaryColumn()
  name: string;

  @OneToMany(() => TeamEntity, (team) => team.division)
  teams: TeamEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
