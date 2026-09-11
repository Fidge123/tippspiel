import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DivisionEntity } from './division.entity';
import { TeamEntity } from './team.entity';

/**
 * The half of a team that changes from season to season. Kept out of `team`
 * because the importer overwrites every column it touches, which silently
 * rescored finished seasons against the current standings.
 */
@Entity({ name: 'team_season' })
export class TeamSeasonEntity {
  @PrimaryColumn()
  teamId: string;

  @PrimaryColumn('int4')
  year: number;

  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'teamId' })
  team: TeamEntity;

  @Column()
  logo: string;

  @Column()
  abbreviation: string;

  @Column()
  shortName: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  divisionName?: string;

  @ManyToOne(() => DivisionEntity)
  @JoinColumn({ name: 'divisionName' })
  division: DivisionEntity;

  @Column({ type: 'int4', nullable: true })
  playoffSeed?: number;

  @Column({ type: 'int4', nullable: true })
  wins?: number;

  @Column({ type: 'int4', nullable: true })
  losses?: number;

  @Column({ type: 'int4', nullable: true })
  ties?: number;

  @Column({ type: 'int4', nullable: true })
  pointsFor?: number;

  @Column({ type: 'int4', nullable: true })
  pointsAgainst?: number;

  @Column({ type: 'int4', nullable: true })
  streak?: number;

  @Column({ nullable: true })
  color1?: string;

  @Column({ nullable: true })
  color2?: string;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
