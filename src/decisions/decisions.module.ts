import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecisionsController as AdminDecisionsController } from './admin/decisions.controller';
import { DecisionDatasetsService } from './decision-datasets.service';
import { DecisionDataset } from './decision-dataset.entity';
import { Profession } from '../professions/profession.entity';
import { ProfessionsService } from '../professions/professions.service';
import { ProfessionVersion } from '../professions/profession-version.entity';
import { ProfessionVersionsService } from '../professions/profession-versions.service';
import { ProfessionsSearchService } from '../professions/professions-search.service';
import { SearchModule } from '../search/search.module';
import { OrganisationVersionsService } from '../organisations/organisation-versions.service';
import { OrganisationVersion } from '../organisations/organisation-version.entity';
import { OrganisationsSearchService } from '../organisations/organisations-search.service';
import { Organisation } from '../organisations/organisation.entity';
import { OrganisationsService } from '../organisations/organisations.service';
import { NewController } from './admin/new.controller';
import { EditController } from './admin/edit.controller';
import { PublicationController } from './admin/publication.controller';
import { SubmissionController } from './admin/submission.controller';
import { ShowController } from './admin/show.controller';
import { DecisionsController } from './decisions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DecisionDataset]),
    TypeOrmModule.forFeature([Profession]),
    TypeOrmModule.forFeature([Organisation]),
    TypeOrmModule.forFeature([ProfessionVersion]),
    TypeOrmModule.forFeature([OrganisationVersion]),
    SearchModule.register(),
  ],
  providers: [
    DecisionDatasetsService,
    ProfessionsService,
    OrganisationsService,
    ProfessionVersionsService,
    OrganisationVersionsService,
    ProfessionsSearchService,
    OrganisationsSearchService,
  ],
  controllers: [
    DecisionsController,
    AdminDecisionsController,
    ShowController,
    NewController,
    EditController,
    PublicationController,
    SubmissionController,
  ],
})
export class DecisionsModule {}
