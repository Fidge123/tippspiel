import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ResetEntity } from './reset.entity';
import { VerifyEntity } from './verify.entity';

@Entity('user')
export class UserEntity {
  @Column({ primary: true, generated: true })
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ select: false })
  salt: string;

  @Column()
  name: string;

  @OneToMany(() => ResetEntity, (reset) => reset.user)
  resetTokens: ResetEntity[];

  @OneToMany(() => VerifyEntity, (verify) => verify.user)
  verifyTokens: VerifyEntity[];

  @Column({ default: false })
  verified: boolean;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
