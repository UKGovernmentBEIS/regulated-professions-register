import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Qualification } from './qualification.entity';

@Injectable()
export class QualificationsService {
  constructor(
    @InjectRepository(Qualification)
    private repository: Repository<Qualification>,
  ) {}

  all(): Promise<Qualification[]> {
    return this.repository.find();
  }

  find(id: string): Promise<Qualification> {
    return this.repository.findOne(id);
  }
}
