import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity, ResetEntity, VerifyEntity } from './entity/';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ResetEntity, VerifyEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
