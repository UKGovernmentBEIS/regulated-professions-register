import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Industry } from '../../../industries/industry.entity';
import { IndustriesService } from '../../../industries/industries.service';
import { Nation } from '../../../nations/nation';
import { ProfessionsService } from '../../professions.service';
import { FilterHelper } from '../../helpers/filter.helper';
import { FilterInput } from '../../interfaces/filter-input.interface';
import { IndexTemplate } from './interfaces/index-template.interface';
import { ListPresenter, ListPresenterView } from './list.presenter';
import { AuthenticationGuard } from '../../../common/authentication.guard';
import { User, UserRole } from '../../../users/user.entity';
import { FilterDto } from './dto/filter.dto';
import { OrganisationsService } from '../../../organisations/organisations.service';
import { Organisation } from '../../../organisations/organisation.entity';

@Controller('admin/professions/list')
export class ListController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly organisationsService: OrganisationsService,
    private readonly industriesService: IndustriesService,
    private readonly i18Service: I18nService,
  ) {}

  @Get()
  @UseGuards(AuthenticationGuard)
  @Render('professions/admin/list/index')
  async index(@Req() request: Request): Promise<IndexTemplate> {
    return this.createListEntries(new FilterDto(), request);
  }

  @Post()
  @UseGuards(AuthenticationGuard)
  @Render('professions/admin/list/index')
  async create(
    @Body() filter: FilterDto,
    @Req() request: Request,
  ): Promise<IndexTemplate> {
    return this.createListEntries(filter, request);
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

    const overview = user.roles.includes(UserRole.Admin);

    const view: ListPresenterView = overview
      ? 'overview'
      : 'single-organisation';

    // Once the user has an organisation, we will want to use that here for
    // non-admin users
    const userOrganisaiton = overview ? null : allOrganisations[0];

    const filterInput = this.getFilterInput(
      filter,
      allNations,
      allOrganisations,
      allIndustries,
    );

    if (userOrganisaiton !== null) {
      filterInput.organisations = [userOrganisaiton];
    }

    const filteredProfessions = new FilterHelper(allProfessions).filter(
      filterInput,
    );

    return new ListPresenter(
      filterInput,
      userOrganisaiton,
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
