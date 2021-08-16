import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { randomBytes, scrypt as s } from 'crypto';
import { promisify } from 'util';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserEntity, ResetEntity, VerifyEntity } from './entity';

const scrypt = promisify(s);

@Injectable()
export class UserDataService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(VerifyEntity)
    private verifyRepo: Repository<VerifyEntity>,
    @InjectRepository(ResetEntity)
    private resetRepo: Repository<ResetEntity>,
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

  async createUser(
    email: string,
    name: string,
    password: string,
  ): Promise<[string, string]> {
    const salt = randomBytes(128);

    try {
      const user = new UserEntity();
      user.email = email;
      user.name = name;
      user.salt = salt.toString('hex');
      user.password = await hash(password, salt);

      const token = new VerifyEntity();
      token.token = randomBytes(128).toString('hex');
      token.user = user;

      const userEntity = await this.userRepo.save(user);
      await this.verifyRepo.save(token);
      return [userEntity.id, token.token];
    } catch (error) {
      throw new HttpException(
        'A user with that email already exists!',
        HttpStatus.CONFLICT,
      );
    }
  }

  async verify(id: number, token: string): Promise<void> {
    const user = await this.userRepo.findOne(id).catch(() => {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    });
    const tokenEntity = await this.verifyRepo
      .findOne({ where: { user, token } })
      .catch(() => {
        throw new HttpException('Token not found', HttpStatus.BAD_REQUEST);
      });

    if (tokenEntity) {
      user.verified = true;
      await this.userRepo.save(user);
      await this.verifyRepo.remove(tokenEntity);
    } else {
      throw new HttpException('Token not found', HttpStatus.BAD_REQUEST);
    }
  }

  async sendReset(email: string): Promise<ResetEntity> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (user) {
      const token = new ResetEntity();
      token.token = randomBytes(128).toString('hex');
      token.user = user;
      return this.resetRepo.save(token);
    }
  }

  async resetPassword(
    id: number,
    password: string,
    token: string,
  ): Promise<void> {
    const user = await this.userRepo.findOne(id).catch(() => {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    });
    const tokenEntity = await this.resetRepo
      .findOne({ where: { user, token } })
      .catch(() => {
        throw new HttpException('Token not found', HttpStatus.BAD_REQUEST);
      });

    if (tokenEntity) {
      const salt = randomBytes(128);
      user.salt = salt.toString('hex');
      user.password = await hash(password, salt);
      await this.userRepo.save(user);
      await this.resetRepo.remove(tokenEntity);
    } else {
      throw new HttpException('Token not found', HttpStatus.BAD_REQUEST);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanUp(): Promise<void> {
    const today = new Date();
    const oneDayInMS = 24 * 60 * 60 * 1000;

    const resetTokens = await this.resetRepo.find({
      where: { createdAt: LessThan(new Date(today.getTime() - oneDayInMS)) },
    });

    const verifyTokens = await this.verifyRepo.find({
      where: {
        createdAt: LessThan(new Date(today.getTime() - 7 * oneDayInMS)),
      },
    });

    const users = await this.userRepo.find({
      where: {
        createdAt: LessThan(new Date(today.getTime() - 7 * oneDayInMS)),
        verified: false,
      },
    });

    console.log(
      `Deleting ${resetTokens.length} reset tokens, ${verifyTokens.length} verify tokens and ${users.length} unverified users!`,
    );

    await Promise.all([
      this.resetRepo.remove(resetTokens),
      this.verifyRepo.remove(verifyTokens),
      this.userRepo.remove(users),
    ]);
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepo.delete(id);
  }
}

async function hash(password: string, salt: Buffer): Promise<string> {
  const hash: any = await scrypt(password.normalize(), salt, 128);
  return hash.toString('hex');
}
