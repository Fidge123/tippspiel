import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Team {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  shortName: string;

  @Column()
  abbrev: string;

  @Column('blob')
  logo: Buffer;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
