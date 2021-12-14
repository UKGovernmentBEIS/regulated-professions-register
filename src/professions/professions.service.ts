import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Profession } from './profession.entity';

@Injectable()
export class ProfessionsService {
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

  async create(profession: Profession): Promise<Profession> {
    return this.repository.save(profession);
  }
}
