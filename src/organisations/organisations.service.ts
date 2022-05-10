import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organisation } from './organisation.entity';
import { SlugGenerator } from '../common/slug-generator';

@Injectable()
export class OrganisationsService {
  constructor(
    @InjectRepository(Organisation)
    private repository: Repository<Organisation>,
  ) {}

  all(): Promise<Organisation[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  find(id: string): Promise<Organisation> {
    return this.repository.findOne(id);
  }

  async findWithVersion(id: string, versionId: string): Promise<Organisation> {
    const organisation = await this.repository.findOne({
      where: { id },
      relations: ['versions'],
    });

    if (organisation === undefined) throw new NotFoundException();

    const version = organisation.versions.find(
      (version) => version.id == versionId,
    );

    if (version === undefined) throw new NotFoundException();

    return Organisation.withVersion(organisation, version);
  }

  findBySlug(slug: string): Promise<Organisation> {
    return this.repository.findOne({
      where: { slug },
    });
  }

  async save(organisation: Organisation): Promise<Organisation> {
    return this.repository.save(organisation);
  }

  async setSlug(organisation: Organisation): Promise<Organisation> {
    const slugGenerator = new SlugGenerator(this, organisation.name);

    organisation.slug = await slugGenerator.slug();

    return await this.repository.save(organisation);
  }

  async rename(oldName: string, newName: string): Promise<string> {
    const organisation = await this.repository.findOne({
      name: oldName,
    });

    if (!organisation) {
      throw new Error(`No organisation with name "${oldName}" found`);
    }

    const newSlug = await new SlugGenerator(this, newName).slug();

    await this.repository.save({
      ...organisation,
      name: newName,
      slug: newSlug,
    });
    return organisation.slug;
  }
}
