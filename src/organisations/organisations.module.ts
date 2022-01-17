import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustriesService } from '../industries/industries.service';
import { Industry } from '../industries/industry.entity';
import { Organisation } from './organisation.entity';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController } from './admin/organisations.controller';
import { SearchController } from './search/search.controller';

@Module({
  providers: [OrganisationsService, IndustriesService],
  controllers: [OrganisationsController, SearchController],
  imports: [
    TypeOrmModule.forFeature([Organisation]),
    TypeOrmModule.forFeature([Industry]),
  ],
})
export class OrganisationsModule {}
