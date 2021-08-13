import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, scrypt as s } from 'crypto';
import { promisify } from 'util';
import { UserEntity } from './entity/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

const scrypt = promisify(s);

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.userRepo.find();
  }

  async login(email: string, password: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      select: ['salt', 'password'],
      where: { email },
    });
    return (
      !!user &&
      user.password === (await hash(password, Buffer.from(user.salt, 'hex')))
    );
  }

  async createUser(email: string, name: string, password: string) {
    const salt = randomBytes(128);

    try {
      const user = new UserEntity();
      user.email = email;
      user.name = name;
      user.salt = salt.toString('hex');
      user.password = await hash(password, salt);

      return await this.userRepo.save(user);
    } catch (error) {
      throw new HttpException(
        'A user with that email already exists!',
        HttpStatus.CONFLICT,
      );
    }
  }

  async sendReset(email: string) {}

  async resetPassword(id: string, password: string) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanUpResetTokens() {}

  async deleteUser(id: string) {
    return this.userRepo.delete(id);
  }
}

async function hash(password: string, salt: Buffer) {
  const hash: any = await scrypt(password.normalize(), salt, 128);
  return hash.toString('hex');
}
