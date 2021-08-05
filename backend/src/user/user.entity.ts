import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
