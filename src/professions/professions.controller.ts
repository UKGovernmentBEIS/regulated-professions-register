import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Render,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';
import { Nation } from '../nations/nation';
import QualificationPresenter from '../qualifications/presenters/qualification.presenter';
import { ShowTemplate } from './interfaces/show-template.interface';
import { BackLink } from '../common/decorators/back-link.decorator';
import { ProfessionVersionsService } from './profession-versions.service';
import { getGroupedTierOneOrganisationsFromProfession } from './helpers/get-grouped-tier-one-organisations-from-profession.helper';
import { getOrganisationsFromProfessionByRole } from './helpers/get-organisations-from-profession-by-role';
import { isUK } from '../helpers/nations.helper';
import { NationsListPresenter } from '../nations/presenters/nations-list.presenter';
import { organisationList } from './presenters/organisation-list';
import { DecisionDatasetYearsPresenter } from './presenters/decision-dataset-years.presenter';
import { DecisionDatasetsService } from '../decisions/decision-datasets.service';
import { OrganisationRole } from './profession-to-organisation.entity';

@Controller()
export class ProfessionsController {
  constructor(
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly decisionDatasetsService: DecisionDatasetsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/professions/:slug')
  @Render('professions/show')
  @BackLink(
    (request: Request) => request.session.searchResultUrl,
    'app.backToSearch',
  )
  async show(@Param('slug') slug: string): Promise<ShowTemplate> {
    const profession =
      await this.professionVersionsService.findLiveBySlug(slug);

    const decisionYears =
      await this.decisionDatasetsService.allLiveYearsForProfession(profession);

    if (!profession) {
      throw new NotFoundException(
        `A profession with ID ${slug} could not be found`,
      );
    }

    const tierOneOrganisations = getGroupedTierOneOrganisationsFromProfession(
      profession,
      'latestLiveVersion',
    );

    const awardingBodies = getOrganisationsFromProfessionByRole(
      profession,
      OrganisationRole.AwardingBody,
      'latestLiveVersion',
    );

    const enforcementBodies = getOrganisationsFromProfessionByRole(
      profession,
      OrganisationRole.EnforcementBody,
      'latestLiveVersion',
    );

    const nations = new NationsListPresenter(
      (profession.occupationLocations || []).map((code) => Nation.find(code)),
      this.i18nService,
    );

    const industries = (profession.industries || []).map(
      (industry) => this.i18nService.translate<string>(industry.name) as string,
    );

    const qualification = profession.qualification
      ? new QualificationPresenter(
          profession.qualification,
          this.i18nService,
          awardingBodies,
        )
      : null;

    const decisionYearsPresenter = decisionYears.length
      ? new DecisionDatasetYearsPresenter(
          decisionYears,
          profession,
          this.i18nService,
        )
      : null;

    return {
      profession,
      qualifications: qualification
        ? qualification.summaryList(
            false,
            profession.occupationLocations
              ? !isUK(profession.occupationLocations)
              : true,
          )
        : null,
      nations: nations.htmlList(),
      industries,
      enforcementBodies: organisationList(enforcementBodies),
      organisations: tierOneOrganisations,
      decisionYears: decisionYearsPresenter?.summaryList(),
    };
  }
}
