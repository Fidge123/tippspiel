import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { BetEntity } from './bet.entity';
import { BetDoublerEntity } from './betDoubler.entity';
import { DivisionBetEntity } from './divisionBet.entity';
import { SuperbowlBetEntity } from './superbowlBet.entity';
import { TeamEntity } from './team.entity';
import { WeekEntity } from './week.entity';

@Entity({ name: 'game' })
export class GameEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  date: Date;

  @ManyToOne(() => WeekEntity, (week) => week.games)
  week: WeekEntity;

  @ManyToOne(() => TeamEntity, (team) => team.awayGames)
  awayTeam: TeamEntity;

  @ManyToOne(() => TeamEntity, (team) => team.homeGames)
  homeTeam: TeamEntity;

  @OneToMany(() => BetEntity, (bet) => bet.game)
  bets: BetEntity[];

  @OneToMany(() => DivisionBetEntity, (bet) => bet.user)
  divisionBets: DivisionBetEntity[];

  @OneToMany(() => SuperbowlBetEntity, (bet) => bet.user)
  superbowlBets: SuperbowlBetEntity[];

  @OneToMany(() => BetDoublerEntity, (doubler) => doubler.user)
  doubler: BetDoublerEntity[];

  @Column()
  awayScore: number;

  @Column()
  homeScore: number;

  @Column()
  winner: 'home' | 'away' | 'none';

  @Column()
  status: string;
  // | 'STATUS_SCHEDULED'
  // | 'STATUS_IN_PROGRESS'
  // | 'STATUS_HALFTIME'
  // | 'STATUS_END_PERIOD'
  // | 'STATUS_FINAL'
  // | 'STATUS_CANCELED';

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
