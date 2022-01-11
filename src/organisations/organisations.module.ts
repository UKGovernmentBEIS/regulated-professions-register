import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustriesService } from '../industries/industries.service';
import { Industry } from '../industries/industry.entity';
import { Organisation } from './organisation.entity';
import { OrganisationsService } from './organisations.service';
import { SearchController } from './search/search.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organisation]),
    TypeOrmModule.forFeature([Industry]),
  ],
  providers: [OrganisationsService, IndustriesService],
  controllers: [SearchController],
})
export class OrganisationsModule {}
