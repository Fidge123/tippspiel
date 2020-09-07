import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tipp } from './tipp.entity';
import axios from 'axios';

@Injectable()
export class TippService {
  constructor(
    @InjectRepository(Tipp)
    private sbRepo: Repository<Tipp>,
  ) {}

  findAll(): Promise<Tipp[]> {
    return this.sbRepo.find();
  }

  findOne(url: string): Promise<Tipp> {
    return this.sbRepo.findOne(url);
  }

  async remove(id: string): Promise<void> {
    await this.sbRepo.delete(id);
  }
}
