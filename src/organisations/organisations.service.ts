import { FindManyOptions, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organisation } from './organisation.entity';

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectRepository(Organisation)
    private repository: Repository<Organisation>,
  ) {}

  all(options: FindManyOptions = {}): Promise<Organisation[]> {
    return this.repository.find(options);
  }

  find(id: string): Promise<Organisation> {
    return this.repository.findOne(id);
  }
}
