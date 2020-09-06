import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne } from 'typeorm';
import { Entry } from './entry.entity';
import { League } from './league.entity';

@Entity()
export class Calendar {
  @PrimaryColumn()
  endDate: string;

  @OneToMany(
    () => Entry,
    entry => entry.calendar,
  )
  entries: Entry[];

  @Column()
  label: string;

  @PrimaryColumn()
  startDate: string;

  @Column()
  value: string;

  @ManyToOne(
    () => League,
    league => league.calendar,
  )
  league: League;
}
