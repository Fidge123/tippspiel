import { Controller, Get, Post, Body } from '@nestjs/common';
import { TippService } from './tipp.service';
import { Tipp } from './tipp.entity';
import { CreateTippDto } from './tipp.dto';

@Controller('tipp')
export class TippController {
  constructor(private readonly tippService: TippService) {}

  @Get()
  async getAll(): Promise<Tipp[]> {
    return this.tippService.findAll();
  }

  @Post()
  async setTipp(@Body() createTipp: CreateTippDto): Promise<Tipp> {
    return this.tippService.update(createTipp);
  }
}
