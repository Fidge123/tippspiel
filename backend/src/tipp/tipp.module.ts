import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TippService } from './tipp.service';
import { TippController } from './tipp.controller';
import { Tipp } from './tipp.entity';
import { ScoreboardModule } from 'src/scoreboard/scoreboard.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tipp]), ScoreboardModule],
  providers: [TippService],
  controllers: [TippController],
})
export class TippModule {}
