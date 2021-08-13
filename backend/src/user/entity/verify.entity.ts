import { Entity, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('verify')
export class VerifyEntity {
  @Column({ primary: true, generated: true })
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.verifyTokens)
  user: UserEntity;

  @Column()
  token: string;

  @CreateDateColumn()
  createdAt: Date;
}
