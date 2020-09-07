import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TippService } from './tipp.service';
import { TippController } from './tipp.controller';
import { Tipp } from './tipp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tipp])],
  providers: [TippService],
  controllers: [TippController],
})
export class TippModule {}
