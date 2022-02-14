import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profession } from './profession.entity';
import { ProfessionsService } from './professions.service';
import { ProfessionsController } from './professions.controller';
import { TopLevelInformationController } from './admin/top-level-information.controller';
import { IndustriesService } from '../industries/industries.service';
import { Industry } from '../industries/industry.entity';
import { CheckYourAnswersController } from './admin/check-your-answers.controller';
import { ConfirmationController } from './admin/confirmation.controller';
import { SearchController } from './search/search.controller';
import { RegulatoryBodyController } from './admin/regulatory-body.controller';
import { Organisation } from '../organisations/organisation.entity';
import { OrganisationsService } from '../organisations/organisations.service';
import { RegulatedActivitiesController } from './admin/regulated-activities.controller';
import { ProfessionsController as AdminProfessionsController } from './admin/professions.controller';
import { QualificationInformationController } from './admin/qualification-information.controller';
import { LegislationController } from './admin/legislation.controller';
import { ProfessionVersionsService } from './profession-versions.service';
import { ProfessionVersion } from './profession-version.entity';
import { ProfessionVersionsController } from './admin/profession-versions.controller';
import { RegistrationController } from './admin/registration.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profession]),
    TypeOrmModule.forFeature([ProfessionVersion]),
    TypeOrmModule.forFeature([Industry]),
    TypeOrmModule.forFeature([Organisation]),
  ],
  providers: [
    ProfessionsService,
    IndustriesService,
    OrganisationsService,
    ProfessionVersionsService,
  ],
  controllers: [
    SearchController,
    ProfessionsController,
    ProfessionVersionsController,
    TopLevelInformationController,
    RegulatoryBodyController,
    RegulatedActivitiesController,
    QualificationInformationController,
    LegislationController,
    CheckYourAnswersController,
    ConfirmationController,
    AdminProfessionsController,
    RegistrationController,
  ],
})
export class ProfessionsModule {}
