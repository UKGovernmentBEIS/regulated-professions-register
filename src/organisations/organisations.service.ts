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

  async allWithProfessions(): Promise<Organisation[]> {
    const organisations = await this.repository.find({
      order: { name: 'ASC' },
      relations: ['professions'],
    });

    return organisations.map((organisation) =>
      this.filterConfirmedProfessions(organisation),
    );
  }

  find(id: string): Promise<Organisation> {
    return this.repository.findOne(id);
  }

  findBySlug(slug: string): Promise<Organisation> {
    return this.repository.findOne({
      where: { slug },
    });
  }

  async findBySlugWithProfessions(slug: string): Promise<Organisation> {
    const organisation = await this.repository.findOne({
      where: { slug },
      relations: ['professions'],
    });

    return this.filterConfirmedProfessions(organisation);
  }

  async save(organisation: Organisation): Promise<Organisation> {
    return this.repository.save(organisation);
  }

  private filterConfirmedProfessions(organisation: Organisation): Organisation {
    organisation.professions = organisation.professions.filter(
      (profession) => profession.confirmed,
    );

    return organisation;
  }
}
