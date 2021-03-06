import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { Permissions } from '../../common/permissions.decorator';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { Validator } from '../../helpers/validator';
import { Organisation } from '../../organisations/organisation.entity';
import { OrganisationsService } from '../../organisations/organisations.service';
import { RegulatedAuthoritiesSelectPresenter } from '../../professions/admin/presenters/regulated-authorities-select-presenter';
import { User } from '../user.entity';
import { UserPermission } from '../user-permission';
import { UsersService } from '../users.service';
import { OrganisationDto } from './dto/organisation.dto';
import { EditTemplate } from './interfaces/edit-template.interface';
import { ServiceOwnerRadioButtonArgsPresenter } from '../presenters/service-owner-radio-buttons.presenter';
import {
  getActionTypeFromUser,
  ActionType,
} from '../helpers/get-action-type-from-user';
import { getActingUser } from '../helpers/get-acting-user.helper';
import { checkUserIsServiceOwner } from '../helpers/check-user-is-service-owner.helper';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { getUserEditStepBackLink } from '../helpers/get-user-edit-step-back-link.helper';
import { UserEditSource } from '../users.controller';

@Controller('/admin/users')
@UseGuards(AuthenticationGuard)
export class OrganisationController {
  constructor(
    private readonly usersService: UsersService,
    private readonly organisationsService: OrganisationsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get(':id/organisation/edit')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @BackLink((request: Request) =>
    getUserEditStepBackLink(request.query, '/admin/users'),
  )
  async edit(
    @Req() req: RequestWithAppSession,
    @Res() res: Response,
    @Param('id') id,
    @Query('source') source: UserEditSource,
  ): Promise<void> {
    checkUserIsServiceOwner(getActingUser(req));

    const user = await this.usersService.find(id);

    return this.renderForm(
      res,
      user.organisation,
      user.serviceOwner,
      user.name,
      source,
      getActionTypeFromUser(user),
    );
  }

  @Post(':id/organisation')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @BackLink((request: Request) =>
    getUserEditStepBackLink(request.body, '/admin/users'),
  )
  async update(
    @Req() req: RequestWithAppSession,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() organisationDto,
  ): Promise<void> {
    checkUserIsServiceOwner(getActingUser(req));

    const validator = await Validator.validate(
      OrganisationDto,
      organisationDto,
    );
    const submittedValues = validator.obj;

    const user = await this.usersService.find(id);

    const serviceOwner =
      submittedValues.serviceOwner === undefined
        ? undefined
        : Boolean(Number(submittedValues.serviceOwner));

    const organisation = submittedValues.organisation
      ? serviceOwner
        ? undefined
        : await this.organisationsService.find(submittedValues.organisation)
      : undefined;

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      return this.renderForm(
        res,
        organisation,
        serviceOwner,
        user.name,
        submittedValues.source,
        getActionTypeFromUser(user),
        errors,
      );
    }

    const updatedUser: User = {
      ...user,
      serviceOwner,
      organisation,
    };

    await this.usersService.save(updatedUser);

    if (submittedValues.source) {
      return res.redirect(`/admin/users/${id}/confirm`);
    }

    return res.redirect(`/admin/users/${id}/personal-details/edit`);
  }

  private async renderForm(
    res: Response,
    organisation: Organisation | null,
    serviceOwner: boolean | null,
    name: string,
    source: UserEditSource,
    action: ActionType,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const organisations = await this.organisationsService.all();

    const organisationsSelectArgs = new RegulatedAuthoritiesSelectPresenter(
      organisations,
      organisation,
      null,
      this.i18nService,
    ).selectArgs();

    const serviceOwnerRadioButtonArgs =
      new ServiceOwnerRadioButtonArgsPresenter(
        serviceOwner,
        this.i18nService,
      ).radioButtonArgs();

    const templateArgs: EditTemplate = {
      organisationsSelectArgs,
      serviceOwnerRadioButtonArgs,
      name,
      source,
      errors,
      action,
    };

    res.render('admin/users/organisation/edit', templateArgs);
  }
}
