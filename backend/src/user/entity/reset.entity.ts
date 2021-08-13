import { Entity, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('reset')
export class ResetEntity {
  @Column({ primary: true, generated: true })
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.resetTokens)
  user: UserEntity;

  @Column()
  token: string;

  @CreateDateColumn()
  createdAt: Date;
}
