import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { GameEntity } from "./game.entity";
import { ByeEntity } from "./bye.entity";
import { DivisionEntity } from "./division.entity";
import { DivisionBetEntity } from "./divisionBet.entity";
import { SuperbowlBetEntity } from "./superbowlBet.entity";

@Entity({ name: "team" })
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

  @Column({ nullable: true })
  playoffSeed?: number;

  @Column({ nullable: true })
  wins?: number;

  @Column({ nullable: true })
  losses?: number;

  @Column({ nullable: true })
  ties?: number;

  @Column({ nullable: true })
  pointsFor?: number;

  @Column({ nullable: true })
  pointsAgainst?: number;

  @Column({ nullable: true })
  streak?: number;

  @Column({ nullable: true })
  color1?: string;

  @Column({ nullable: true })
  color2?: string;

  @ManyToOne(() => DivisionEntity, (division) => division.teams)
  division: DivisionEntity;

  @OneToMany(() => DivisionBetEntity, (bet) => bet.team)
  divisionBets: DivisionBetEntity[];

  @OneToMany(() => SuperbowlBetEntity, (bet) => bet.team)
  superbowlBets: SuperbowlBetEntity[];

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
