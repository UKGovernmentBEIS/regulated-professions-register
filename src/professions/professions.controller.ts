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
import { Organisation } from '../organisations/organisation.entity';
import { ProfessionVersionsService } from './profession-versions.service';
import { getOrganisationsFromProfession } from './helpers/get-organisations-from-profession.helper';
import { isUK } from '../helpers/nations.helper';
import { NationsListPresenter } from '../nations/presenters/nations-list.presenter';

@Controller()
export class ProfessionsController {
  constructor(
    private professionVersionsService: ProfessionVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/professions/:slug')
  @Render('professions/show')
  @BackLink(
    (request: Request) => request.session.searchResultUrl,
    'app.backToSearch',
  )
  async show(@Param('slug') slug: string): Promise<ShowTemplate> {
    const profession = await this.professionVersionsService.findLiveBySlug(
      slug,
    );

    if (!profession) {
      throw new NotFoundException(
        `A profession with ID ${slug} could not be found`,
      );
    }

    const organisations = getOrganisationsFromProfession(profession).map(
      (organisation) => Organisation.withLatestLiveVersion(organisation),
    );

    const nations = new NationsListPresenter(
      (profession.occupationLocations || []).map((code) => Nation.find(code)),
      this.i18nService,
    );

    const industries = (profession.industries || []).map((industry) =>
      this.i18nService.translate<string>(industry.name),
    );

    const qualification = profession.qualification
      ? new QualificationPresenter(profession.qualification, this.i18nService)
      : null;

    return {
      profession,
      qualifications: qualification
        ? await qualification.summaryList(
            false,
            profession.occupationLocations
              ? !isUK(profession.occupationLocations)
              : true,
          )
        : null,
      nations: await nations.htmlList(),
      industries,
      organisations,
    };
  }
}
