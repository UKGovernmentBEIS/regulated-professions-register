import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { UserPermission } from '../../users/user-permission';
import { Permissions } from '../../common/permissions.decorator';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { ProfessionsService } from '../../professions/professions.service';
import { Response } from 'express';
import { OrganisationsService } from '../../organisations/organisations.service';
import { EditTemplate } from './interfaces/edit/edit-template.interface';
import { DecisionRoute } from '../interfaces/decision-route.interface';
import { EditDto } from './dto/edit.dto';
import {
  DecisionDataset,
  DecisionDatasetStatus,
} from '../decision-dataset.entity';
import { DecisionDatasetEditPresenter } from './presenters/decision-dataset-edit.presenter';
import { parseEditDtoDecisionRoutes } from './helpers/parse-edit-dto-decision-routes.helper';
import { modifyDecisionRoutes } from './helpers/modify-decision-routes.helper';
import { checkCanChangeDataset } from './helpers/check-can-change-dataset.helper';
import { checkCanPublishDataset } from './helpers/check-can-publish-dataset.helper';
import { flashMessage } from '../../common/flash-message';

const emptyCountry = {
  code: null,
  decisions: {
    yes: null,
    no: null,
    yesAfterComp: null,
    noAfterComp: null,
  },
};

@UseGuards(AuthenticationGuard)
@Controller('admin/decisions')
export class EditController {
  constructor(
    private readonly decisionDatasetsService: DecisionDatasetsService,
    private readonly professionsService: ProfessionsService,
    private readonly organisationsService: OrganisationsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get(':professionId/:organisationId/:year/edit')
  @Permissions(
    UserPermission.UploadDecisionData,
    UserPermission.DownloadDecisionData,
    UserPermission.ViewDecisionData,
  )
  @Render('admin/decisions/edit')
  async edit(
    @Param('professionId') professionId: string,
    @Param('organisationId') organisationId: string,
    @Param('year', ParseIntPipe) year: number,
    @Req() request: RequestWithAppSession,
  ): Promise<EditTemplate> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const organisation = await this.organisationsService.find(organisationId);

    const dataset = await this.decisionDatasetsService.find(
      professionId,
      organisationId,
      year,
    );

    checkCanChangeDataset(request, profession, organisation, year, !!dataset);

    const routes: DecisionRoute[] = dataset
      ? dataset.routes
      : [
          {
            name: '',
            countries: [emptyCountry],
          },
        ];

    return {
      year,
      profession,
      organisation,

      routes: new DecisionDatasetEditPresenter(
        routes,
        this.i18nService,
      ).present(),
    };
  }

  @Post(':professionId/:organisationId/:year/edit')
  @Permissions(
    UserPermission.UploadDecisionData,
    UserPermission.DownloadDecisionData,
    UserPermission.ViewDecisionData,
  )
  async update(
    @Param('professionId') professionId: string,
    @Param('organisationId') organisationId: string,
    @Param('year', ParseIntPipe) year: number,
    @Body() editDto: EditDto,
    @Req() request: RequestWithAppSession,
    @Res() response: Response,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const organisation = await this.organisationsService.find(organisationId);

    const dataset = await this.decisionDatasetsService.find(
      professionId,
      organisationId,
      year,
    );

    checkCanChangeDataset(request, profession, organisation, year, !!dataset);

    const routes = parseEditDtoDecisionRoutes(editDto);

    const action = editDto.action;

    if (action === 'publish' || action === 'save' || action === 'submit') {
      if (action === 'publish') {
        checkCanPublishDataset(request);
      }

      const newDataset: DecisionDataset = {
        organisation,
        profession,
        user: getActingUser(request),
        year,
        status: DecisionDatasetStatus.Draft,
        routes,
        updated_at: undefined,
        created_at: undefined,
      };

      await this.decisionDatasetsService.save(newDataset);

      if (action === 'publish') {
        return response.redirect(
          `/admin/decisions/${profession.id}/${organisation.id}/${year}/publish?fromEdit=true`,
        );
      }

      if (action === 'submit') {
        return response.redirect(
          `/admin/decisions/${profession.id}/${organisation.id}/${year}/submit?fromEdit=true`,
        );
      }

      const messageTitle = await this.i18nService.translate(
        `decisions.admin.saveAsDraft.confirmation.heading`,
      );

      const messageBody = await this.i18nService.translate(
        `decisions.admin.saveAsDraft.confirmation.body`,
      );

      request.flash('info', flashMessage(messageTitle, messageBody));

      response.redirect(
        `/admin/decisions/${profession.id}/${organisation.id}/${year}`,
      );
    } else {
      modifyDecisionRoutes(routes, action);

      response.render('admin/decisions/edit', {
        profession,
        organisation,
        year,
        routes: new DecisionDatasetEditPresenter(
          routes,
          this.i18nService,
        ).present(),
      } as EditTemplate);
    }
  }
}
