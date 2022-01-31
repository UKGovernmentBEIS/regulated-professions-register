import { Repository, In } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OrganisationVersion,
  OrganisationVersionStatus,
} from './organisation-version.entity';
import { Organisation } from './organisation.entity';

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

  async findLatestForOrganisationId(
    organisationId: string,
  ): Promise<OrganisationVersion> {
    return this.repository.findOne({
      where: {
        organisation: { id: organisationId },
        status: In([
          OrganisationVersionStatus.Draft,
          OrganisationVersionStatus.Live,
        ]),
      },
      order: { created_at: 'DESC' },
      relations: ['organisation'],
    });
  }

  async allLive(): Promise<Organisation[]> {
    const versions = await this.repository
      .createQueryBuilder('organisationVersion')
      .leftJoinAndSelect('organisationVersion.organisation', 'organisation')
      .leftJoinAndSelect('organisation.professions', 'professions')
      .leftJoinAndSelect('professions.industries', 'industries')
      .where('organisationVersion.status = :status', {
        status: OrganisationVersionStatus.Live,
      })
      .getMany();

    return versions.map((version) =>
      Organisation.withVersion(version.organisation, version),
    );
  }
  async confirm(version: OrganisationVersion): Promise<OrganisationVersion> {
    version.status = OrganisationVersionStatus.Draft;

    return this.repository.save(version);
  }
}
