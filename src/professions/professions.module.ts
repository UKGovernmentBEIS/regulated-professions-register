import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profession } from './profession.entity';
import { ProfessionsService } from './professions.service';
import { ProfessionsController } from './professions.controller';
import { TopLevelInformationController } from './admin/add-profession/top-level-information.controller';
import { IndustriesService } from '../industries/industries.service';
import { Industry } from '../industries/industry.entity';
import { CheckYourAnswersController } from './admin/add-profession/check-your-answers.controller';
import { ConfirmationController } from './admin/add-profession/confirmation.controller';
import { SearchController } from './search/search.controller';
import { RegulatoryBodyController } from './admin/add-profession/regulatory-body.controller';
import { Organisation } from '../organisations/organisation.entity';
import { OrganisationsService } from '../organisations/organisations.service';
import { RegulatedActivitiesController } from './admin/add-profession/regulated-activities.controller';
import { ProfessionsController as AdminProfessionsController } from './admin/professions.controller';
import { QualificationInformationController } from './admin/add-profession/qualification-information.controller';
import { LegislationController } from './admin/add-profession/legislation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profession]),
    TypeOrmModule.forFeature([Industry]),
    TypeOrmModule.forFeature([Organisation]),
  ],
  providers: [ProfessionsService, IndustriesService, OrganisationsService],
  controllers: [
    SearchController,
    ProfessionsController,
    TopLevelInformationController,
    RegulatoryBodyController,
    RegulatedActivitiesController,
    QualificationInformationController,
    LegislationController,
    CheckYourAnswersController,
    ConfirmationController,
    AdminProfessionsController,
  ],
})
export class ProfessionsModule {}
