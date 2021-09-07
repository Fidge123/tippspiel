import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('verify')
export class VerifyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.verifyTokens)
  user: UserEntity;

  @Column()
  token: string;

  @CreateDateColumn()
  createdAt: Date;
}
