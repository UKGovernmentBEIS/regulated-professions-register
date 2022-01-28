import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OrganisationVersion,
  OrganisationVersionStatus,
} from './organisation-version.entity';

@Injectable()
export class OrganisationVersionsService {
  constructor(
    @InjectRepository(OrganisationVersion)
    private repository: Repository<OrganisationVersion>,
  ) {}

  async save(organisation: OrganisationVersion): Promise<OrganisationVersion> {
    return this.repository.save(organisation);
  }

  async find(id: string): Promise<OrganisationVersion> {
    return this.repository.findOne(id);
  }

  async confirm(version: OrganisationVersion): Promise<OrganisationVersion> {
    version.status = OrganisationVersionStatus.Draft;

    return this.repository.save(version);
  }
}
