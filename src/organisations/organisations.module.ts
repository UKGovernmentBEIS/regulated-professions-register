import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustriesService } from '../industries/industries.service';
import { Industry } from '../industries/industry.entity';
import { Organisation } from './organisation.entity';
import { OrganisationVersion } from './organisation-version.entity';
import { OrganisationsService } from './organisations.service';
import { OrganisationVersionsService } from './organisation-versions.service';
import { OrganisationsController as AdminOrganisationsController } from './admin/organisations.controller';
import { SearchController } from './search/search.controller';
import { OrganisationsController } from './organisations.controller';

@Module({
  providers: [
    OrganisationsService,
    IndustriesService,
    OrganisationVersionsService,
  ],
  controllers: [
    AdminOrganisationsController,
    SearchController,
    OrganisationsController,
  ],
  imports: [
    TypeOrmModule.forFeature([Organisation]),
    TypeOrmModule.forFeature([OrganisationVersion]),
    TypeOrmModule.forFeature([Industry]),
  ],
})
export class OrganisationsModule {}
