import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
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

  findBySlug(
    slug: string,
    options: FindOneOptions = {},
  ): Promise<Organisation> {
    options = Object.assign({ where: { slug } }, options);
    return this.repository.findOne(options);
  }
}
