import {
  Controller,
  Get,
  Post,
  Query,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Industry } from '../../industries/industry.entity';
import { IndustriesService } from '../../industries/industries.service';
import { Nation } from '../../nations/nation';
import { ProfessionsService } from '../professions.service';
import { ProfessionsFilterHelper } from '../helpers/professions-filter.helper';
import { FilterInput } from '../../common/interfaces/filter-input.interface';
import { IndexTemplate } from './interfaces/index-template.interface';
import {
  ProfessionsPresenter,
  ProfessionsPresenterView,
} from './professions.presenter';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { User } from '../../users/user.entity';
import { FilterDto } from './dto/filter.dto';
import { OrganisationsService } from '../../organisations/organisations.service';
import { Organisation } from '../../organisations/organisation.entity';
import { Profession } from '../profession.entity';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class ProfessionsController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly organisationsService: OrganisationsService,
    private readonly industriesService: IndustriesService,
    private readonly i18Service: I18nService,
  ) {}

  @Post()
  async create(@Res() res: Response): Promise<void> {
    const profession = await this.professionsService.save(new Profession());

    res.redirect(
      `/admin/professions/${profession.id}/top-level-information/edit`,
    );
  }

  @Get()
  @Render('admin/professions/index')
  async index(
    @Req() request: Request,
    @Query() query: FilterDto = null,
  ): Promise<IndexTemplate> {
    return this.createListEntries(query || new FilterDto(), request);
  }

  private async createListEntries(
    filter: FilterDto,
    request: Request,
  ): Promise<IndexTemplate> {
    const allNations = Nation.all();
    const allOrganisations = await this.organisationsService.all();
    const allIndustries = await this.industriesService.all();

    const allProfessions = await this.professionsService.allConfirmed();

    const user = request['appSession'].user as User;

    const showAllOrgs = user.serviceOwner;

    const view: ProfessionsPresenterView = showAllOrgs
      ? 'overview'
      : 'single-organisation';

    // Once the user has an organisation, we will want to use that here for
    // non-admin users. Until then, select a default organisation
    const userOrganisation = showAllOrgs
      ? null
      : allOrganisations.find(
          (organisation) => organisation.name === 'Department for Education',
        ) || allOrganisations[0];

    const filterInput = this.getFilterInput(
      filter,
      allNations,
      allOrganisations,
      allIndustries,
    );

    if (userOrganisation) {
      filterInput.organisations = [userOrganisation];
    }

    const filteredProfessions = new ProfessionsFilterHelper(
      allProfessions,
    ).filter(filterInput);

    return new ProfessionsPresenter(
      filterInput,
      userOrganisation,
      allNations,
      allOrganisations,
      allIndustries,
      filteredProfessions,
      request,
      this.i18Service,
    ).present(view);
  }

  private getFilterInput(
    filter: FilterDto,
    allNations: Nation[],
    allOrganisations: Organisation[],
    allIndustries: Industry[],
  ): FilterInput {
    const nations = allNations.filter((nation) =>
      filter.nations.includes(nation.code),
    );

    const organisations = allOrganisations.filter((organisation) =>
      (filter.organisations || []).includes(organisation.id),
    );

    const industries = allIndustries.filter((industry) =>
      (filter.industries || []).includes(industry.id),
    );

    return { nations, organisations, industries, keywords: filter.keywords };
  }
}
