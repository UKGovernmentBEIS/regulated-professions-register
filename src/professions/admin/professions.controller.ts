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
import { IndustriesService } from '../../industries/industries.service';
import { Nation } from '../../nations/nation';
import { ProfessionsService } from '../professions.service';
import { ProfessionsFilterHelper } from '../helpers/professions-filter.helper';
import { IndexTemplate } from './interfaces/index-template.interface';
import {
  ProfessionsPresenter,
  ProfessionsPresenterView,
} from './professions.presenter';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { User } from '../../users/user.entity';
import { FilterDto } from './dto/filter.dto';
import { OrganisationsService } from '../../organisations/organisations.service';
import { Profession } from '../profession.entity';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { createFilterInput } from '../../helpers/create-filter-input.helper';
import { ProfessionVersionsService } from '../profession-versions.service';
import { ProfessionVersion } from '../profession-version.entity';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class ProfessionsController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly organisationsService: OrganisationsService,
    private readonly industriesService: IndustriesService,
    private readonly i18Service: I18nService,
  ) {}

  @Post()
  async create(@Res() res: Response): Promise<void> {
    const blankProfession = await this.professionsService.save(
      new Profession(),
    );

    const blankVersion = new ProfessionVersion();

    blankVersion.profession = blankProfession;

    const savedVersion = await this.professionVersionsService.save(
      blankVersion,
    );

    res.redirect(
      `/admin/professions/${blankProfession.id}/versions/${savedVersion.id}/top-level-information/edit`,
    );
  }

  @Get()
  @Render('admin/professions/index')
  @BackLink('/admin')
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

    const allProfessions =
      await this.professionVersionsService.allDraftOrLive();

    const user = request['appSession'].user as User;

    const showAllOrgs = user.serviceOwner;

    const view: ProfessionsPresenterView = showAllOrgs
      ? 'overview'
      : 'single-organisation';

    const userOrganisation = showAllOrgs ? null : user.organisation;

    const filterInput = createFilterInput({
      ...filter,
      allNations,
      allOrganisations,
      allIndustries,
    });

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
      this.i18Service,
    ).present(view);
  }
}
