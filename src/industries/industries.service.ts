import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Industry } from './industry.entity';

@Injectable()
export class IndustriesService {
  constructor(
    @InjectRepository(Industry)
    private repository: Repository<Industry>,
  ) {}

  all(): Promise<Industry[]> {
    return this.repository.find();
  }

  find(id: string): Promise<Industry> {
    return this.repository.findOne(id);
  }
}
