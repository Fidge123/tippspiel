import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Tipp {
  @PrimaryColumn()
  user: string;

  @PrimaryColumn()
  game: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  winner: string;

  @Column()
  pointDiff: number;
}
