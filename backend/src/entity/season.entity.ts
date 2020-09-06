import { Entity, Column, PrimaryColumn, OneToOne } from 'typeorm';
import { League } from './league.entity';

@Entity()
export class Season {
  @Column()
  endDate: string;

  @Column()
  startDate: string;

  @PrimaryColumn()
  id: string;

  @Column()
  type: number;

  @Column()
  name: string;

  @Column()
  abbreviation: string;

  @PrimaryColumn()
  year: number;

  @OneToOne(
    () => League,
    league => league.season,
  )
  league: League;
}
