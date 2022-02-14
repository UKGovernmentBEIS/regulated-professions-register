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
import { Response } from 'express';
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
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { UserPermission } from '../../users/user-permission';
import { Permissions } from '../../common/permissions.decorator';

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
  @Permissions(UserPermission.CreateProfession)
  async create(
    @Res() res: Response,
    @Req() req: RequestWithAppSession,
  ): Promise<void> {
    const blankProfession = await this.professionsService.save(
      new Profession(),
    );

    const blankVersion = {
      profession: blankProfession,
      user: req.appSession.user,
    } as ProfessionVersion;

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
    @Req() request: RequestWithAppSession,
    @Query() query: FilterDto = null,
  ): Promise<IndexTemplate> {
    return this.createListEntries(query || new FilterDto(), request);
  }

  private async createListEntries(
    filter: FilterDto,
    request: RequestWithAppSession,
  ): Promise<IndexTemplate> {
    const allNations = Nation.all();
    const allOrganisations = await this.organisationsService.all();
    const allIndustries = await this.industriesService.all();

    const allProfessions =
      await this.professionVersionsService.allDraftOrLive();

    const actingUser = request.appSession.user as User;

    const showAllOrgs = actingUser.serviceOwner;

    const view: ProfessionsPresenterView = showAllOrgs
      ? 'overview'
      : 'single-organisation';

    const userOrganisation = showAllOrgs ? null : actingUser.organisation;

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
