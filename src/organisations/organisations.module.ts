import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from './organisation.entity';
import { OrganisationsService } from './organisations.service';
import { SearchController } from './search/search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Organisation])],
  providers: [OrganisationsService],
  controllers: [SearchController],
})
export class OrganisationsModule {}
