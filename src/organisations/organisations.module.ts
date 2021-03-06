import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustriesService } from '../industries/industries.service';
import { Industry } from '../industries/industry.entity';
import { Organisation } from './organisation.entity';
import { ProfessionVersion } from '../professions/profession-version.entity';
import { OrganisationVersion } from './organisation-version.entity';
import { OrganisationsService } from './organisations.service';
import { OrganisationVersionsService } from './organisation-versions.service';
import { OrganisationsSearchService } from './organisations-search.service';
import { OrganisationsController as AdminOrganisationsController } from './admin/organisations.controller';
import { OrganisationVersionsController as AdminOrganisationVersionsController } from './admin/organisation-versions.controller';

import { SearchController } from './search/search.controller';
import { OrganisationsController } from './organisations.controller';
import { OrganisationPublicationController } from './admin/organisation-publication.controller';
import { OrganisationArchiveController } from './admin/organisation-archive.controller';
import { OrganisationUnarchiveController } from './admin/organisation-unarchive.controller';
import { ProfessionVersionsService } from '../professions/profession-versions.service';
import { ProfessionsSearchService } from '../professions/professions-search.service';
import { SearchModule } from '../search/search.module';

@Module({
  providers: [
    OrganisationsService,
    IndustriesService,
    OrganisationVersionsService,
    ProfessionVersionsService,
    ProfessionsSearchService,
    OrganisationsSearchService,
  ],
  controllers: [
    AdminOrganisationsController,
    AdminOrganisationVersionsController,
    SearchController,
    OrganisationsController,
    OrganisationPublicationController,
    OrganisationArchiveController,
    OrganisationUnarchiveController,
  ],
  imports: [
    TypeOrmModule.forFeature([Organisation]),
    TypeOrmModule.forFeature([OrganisationVersion]),
    TypeOrmModule.forFeature([Industry]),
    TypeOrmModule.forFeature([ProfessionVersion]),
    SearchModule.register(),
  ],
})
export class OrganisationsModule {}
