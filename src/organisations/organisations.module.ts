import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustriesService } from '../industries/industries.service';
import { Industry } from '../industries/industry.entity';
import { Organisation } from './organisation.entity';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController as AdminOrganisationsController } from './admin/organisations.controller';
import { SearchController } from './search/search.controller';
import { OrganisationsController } from './organisations.controller';

@Module({
  providers: [OrganisationsService, IndustriesService],
  controllers: [
    AdminOrganisationsController,
    SearchController,
    OrganisationsController,
  ],
  imports: [
    TypeOrmModule.forFeature([Organisation]),
    TypeOrmModule.forFeature([Industry]),
  ],
})
export class OrganisationsModule {}
