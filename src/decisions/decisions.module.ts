import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecisionsController } from './admin/decisions.controller';
import { DecisionDatasetsService } from './decision-datasets.service';
import { DecisionDataset } from './decision-dataset.entity';
import { Profession } from '../professions/profession.entity';
import { ProfessionsService } from '../professions/professions.service';
import { Organisation } from '../organisations/organisation.entity';
import { OrganisationsService } from '../organisations/organisations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DecisionDataset]),
    TypeOrmModule.forFeature([Profession]),
    TypeOrmModule.forFeature([Organisation]),
  ],
  providers: [
    DecisionDatasetsService,
    ProfessionsService,
    OrganisationsService,
  ],
  controllers: [DecisionsController],
})
export class DecisionsModule {}
