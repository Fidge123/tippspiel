import { Controller, Get } from '@nestjs/common';
import { TippService } from './tipp.service';
import { Tipp } from './tipp.entity';

@Controller()
export class TippController {
  constructor(private readonly tippService: TippService) {}

  @Get()
  async getAll(): Promise<Tipp[]> {
    return await this.tippService.findAll();
  }
}
