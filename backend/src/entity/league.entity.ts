import { Entity, Column, PrimaryColumn, OneToMany, OneToOne } from 'typeorm';
import { Calendar } from './calendar.entity';
import { Season } from './season.entity';

@Entity()
export class League {
  @Column()
  abbreviation: string;

  @OneToMany(
    () => Calendar,
    cal => cal.league,
  )
  calendar: Calendar[];

  @Column()
  calendarEndDate: string;

  @Column()
  calendarIsWhiteList: boolean;

  @Column()
  calendarStartDate: string;

  @Column()
  calendarType: string;

  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @OneToOne(
    () => Season,
    season => season.league,
  )
  season: Season;

  @Column()
  slug: string;

  @Column()
  uid: string;
}
