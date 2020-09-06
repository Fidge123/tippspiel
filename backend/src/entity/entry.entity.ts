import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { Calendar } from './calendar.entity';

@Entity()
export class Entry {
  @Column()
  alternateLabel: string;

  @Column()
  detail: string;

  @Column()
  label: string;

  @PrimaryColumn()
  endDate: string;

  @PrimaryColumn()
  startDate: string;

  @Column()
  value: string;

  @ManyToOne(
    () => Calendar,
    calendar => calendar.entries,
  )
  calendar: Calendar;
}
