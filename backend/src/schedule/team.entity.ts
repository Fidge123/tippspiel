import { GameEntity } from 'src/schedule/game.entity';
import { ByeEntity } from 'src/schedule/bye.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

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

  @OneToMany(() => GameEntity, (game) => game.homeTeam)
  homeGames: GameEntity[];

  @OneToMany(() => GameEntity, (game) => game.awayTeam)
  awayGames: GameEntity[];

  @OneToMany(() => ByeEntity, (bye) => bye.team)
  byes: ByeEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
