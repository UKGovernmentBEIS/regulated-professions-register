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
import { Organisation } from '../organisations/organisation.entity';
import { OrganisationsService } from '../organisations/organisations.service';
import { RegulatedActivitiesController } from './admin/regulated-activities.controller';
import { ProfessionsController as AdminProfessionsController } from './admin/professions.controller';
import { QualificationsController } from './admin/qualifications.controller';
import { LegislationController } from './admin/legislation.controller';
import { ProfessionVersionsService } from './profession-versions.service';
import { ProfessionVersion } from './profession-version.entity';
import { ProfessionVersionsController } from './admin/profession-versions.controller';
import { RegistrationController } from './admin/registration.controller';
import { ScopeController } from './admin/scope.controller';
import { ProfessionPublicationController } from './admin/profession-publication.controller';
import { ProfessionArchiveController } from './admin/profession-archive.controller';
import { OrganisationVersionsService } from '../organisations/organisation-versions.service';
import { OrganisationVersion } from '../organisations/organisation-version.entity';
import { ProfessionsSearchService } from './professions-search.service';
import { OrganisationsSearchService } from '../organisations/organisations-search.service';
import { SearchModule } from '../search/search.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Profession]),
    TypeOrmModule.forFeature([ProfessionVersion]),
    TypeOrmModule.forFeature([Industry]),
    TypeOrmModule.forFeature([Organisation]),
    TypeOrmModule.forFeature([OrganisationVersion]),
    SearchModule.register(),
  ],
  providers: [
    ProfessionsService,
    IndustriesService,
    OrganisationsService,
    OrganisationVersionsService,
    ProfessionsSearchService,
    OrganisationsSearchService,
    ProfessionVersionsService,
  ],
  controllers: [
    SearchController,
    ProfessionsController,
    ProfessionVersionsController,
    TopLevelInformationController,
    ScopeController,
    RegulatedActivitiesController,
    QualificationsController,
    LegislationController,
    CheckYourAnswersController,
    ConfirmationController,
    AdminProfessionsController,
    RegistrationController,
    ProfessionPublicationController,
    ProfessionArchiveController,
  ],
})
export class ProfessionsModule {}
