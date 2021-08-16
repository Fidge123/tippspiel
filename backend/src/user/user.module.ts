import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '../database/database.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    DatabaseModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
