import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organisation } from './organisation.entity';

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectRepository(Organisation)
    private repository: Repository<Organisation>,
  ) {}

  all(): Promise<Organisation[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  allWithProfessions(): Promise<Organisation[]> {
    return this.repository.find({
      order: { name: 'ASC' },
      relations: ['professions'],
    });
  }

  find(id: string): Promise<Organisation> {
    return this.repository.findOne(id);
  }

  findBySlug(slug: string): Promise<Organisation> {
    return this.repository.findOne({
      where: { slug },
    });
  }

  findBySlugWithProfessions(slug: string): Promise<Organisation> {
    return this.repository.findOne({
      where: { slug },
      relations: ['professions'],
    });
  }
}
