import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Profession } from './profession.entity';

@Injectable()
export class ProfessionService {
  constructor(
    @InjectRepository(Profession)
    private repository: Repository<Profession>,
  ) {}

  all(): Promise<Profession[]> {
    return this.repository.find();
  }

  find(id: string): Promise<Profession> {
    return this.repository.findOne(id);
  }
}
