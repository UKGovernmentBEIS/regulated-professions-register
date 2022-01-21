import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganisationVersion } from './organisation-version.entity';

@Injectable()
export class OrganisationVersionsService {
  constructor(
    @InjectRepository(OrganisationVersion)
    private repository: Repository<OrganisationVersion>,
  ) {}

  async save(organisation: OrganisationVersion): Promise<OrganisationVersion> {
    return this.repository.save(organisation);
  }
}
