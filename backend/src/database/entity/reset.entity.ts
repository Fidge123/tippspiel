import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('reset')
export class ResetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.resetTokens)
  user: UserEntity;

  @Column()
  token: string;

  @CreateDateColumn()
  createdAt: Date;
}
