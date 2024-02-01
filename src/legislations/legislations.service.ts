import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Legislation } from './legislation.entity';

@Injectable()
export class LegislationsService {
  constructor(
    @InjectRepository(Legislation)
    private repository: Repository<Legislation>,
  ) {}

  all(): Promise<Legislation[]> {
    return this.repository.find();
  }

  find(id: string): Promise<Legislation> {
    return this.repository.findOneBy({ id });
  }
}
