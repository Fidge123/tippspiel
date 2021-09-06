import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { GameEntity } from './game.entity';
import { ByeEntity } from './bye.entity';
import { DivisionEntity } from './division.entity';
import { DivisionBetEntity } from './divisionBet.entity';

@Entity({ name: 'team' })
export class TeamEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  logo: string;

  @Column()
  abbreviation: string;

  @Column()
  shortName: string;

  @Column()
  name: string;

  @Column()
  wins: number;

  @Column()
  losses: number;

  @Column()
  ties: number;

  @Column({ nullable: true })
  color1: string;

  @Column({ nullable: true })
  color2: string;

  @ManyToOne(() => DivisionEntity, (division) => division.teams)
  division: DivisionEntity;

  @OneToMany(() => DivisionBetEntity, (bet) => bet.team)
  divisionBets: DivisionBetEntity[];

  @OneToMany(() => GameEntity, (game) => game.homeTeam)
  homeGames: GameEntity[];

  @OneToMany(() => GameEntity, (game) => game.awayTeam)
  awayGames: GameEntity[];

  @OneToMany(() => ByeEntity, (bye) => bye.team)
  byes: ByeEntity[];

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
