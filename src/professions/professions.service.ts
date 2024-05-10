import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Profession } from './profession.entity';
import { SlugGenerator } from '../common/slug-generator';

@Injectable()
export class ProfessionsService {
  constructor(
    @InjectRepository(Profession)
    private repository: Repository<Profession>,
  ) {}

  all(): Promise<Profession[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  find(id: string): Promise<Profession> {
    return this.repository.findOne({ where: { id: id } });
  }

  findWithVersions(id: string): Promise<Profession> {
    return this.repository.findOne({
      where: {
        id: id,
      },
      relations: [
        'versions',
        'professionToOrganisations',
        'professionToOrganisations.organisation',
        'professionToOrganisations.profession',
      ],
    });
  }

  findBySlug(slug: string): Promise<Profession> {
    return this.repository.findOne({ where: { slug } });
  }

  async save(profession: Profession): Promise<Profession> {
    return this.repository.save(profession);
  }

  async setSlug(profession: Profession): Promise<Profession> {
    const slugGenerator = new SlugGenerator(this, profession.name);

    profession.slug = await slugGenerator.slug();

    return await this.repository.save(profession);
  }
}
