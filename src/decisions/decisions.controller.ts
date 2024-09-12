import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Render,
} from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { BackLink } from '../common/decorators/back-link.decorator';
import { DecisionDatasetsService } from '../decisions/decision-datasets.service';
import { DecisionDatasetsPresenter } from '../decisions/presenters/decision-datasets.presenter';
import { ShowTemplate } from './interfaces/show-template.interface';
import { ProfessionVersionsService } from '../professions/profession-versions.service';

@Controller()
export class DecisionsController {
  constructor(
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly decisionDatasetsService: DecisionDatasetsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/decisions/:slug/:year')
  @Render('decisions/show')
  @BackLink((request: Request) => {
    const fromInternalPage = request.query.fromInternalPage as string;
    if (fromInternalPage) {
      const [professionId, organisationId] = fromInternalPage.split(':');
      return `/admin/decisions/${professionId}/${organisationId}/:year`;
    } else {
      return '/professions/:slug';
    }
  })
  async show(
    @Param('slug') slug: string,
    @Param('year', ParseIntPipe) year,
  ): Promise<ShowTemplate> {
    const profession =
      await this.professionVersionsService.findLiveBySlug(slug);

    if (!profession) {
      throw new NotFoundException(
        `A profession with ID ${slug} could not be found`,
      );
    }

    const datasets =
      await this.decisionDatasetsService.allLiveForProfessionAndYear(
        profession,
        year,
      );

    if (!datasets.length) {
      throw new NotFoundException(
        `No datasets for profession ${slug} and year ${year} could be found`,
      );
    }

    return new DecisionDatasetsPresenter(
      profession,
      year,
      datasets,
      this.i18nService,
    ).present();
  }
}
