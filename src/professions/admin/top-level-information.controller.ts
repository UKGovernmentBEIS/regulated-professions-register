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
import { Response, Request } from 'express';
import { Validator } from '../../helpers/validator';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { Profession } from '../profession.entity';
import { ProfessionsService } from '../professions.service';
import { TopLevelDetailsDto } from './dto/top-level-details.dto';
import { TopLevelDetailsTemplate } from './interfaces/top-level-details.template';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { BackLink } from '../../common/decorators/back-link.decorator';

import ViewUtils from './viewUtils';
import { OrganisationsService } from '../../organisations/organisations.service';
import { I18nService } from 'nestjs-i18n';
import { OrganisationVersionsService } from '../../organisations/organisation-versions.service';
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class TopLevelInformationController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly organisationsService: OrganisationsService,
    private readonly organisationVersionsService: OrganisationVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:professionId/versions/:versionId/top-level-information/edit')
  @Permissions(UserPermission.CreateProfession)
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Query('change') change: string,
    @Req() req: RequestWithAppSession,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    checkCanChangeProfession(req, profession);

    return this.renderForm(
      res,
      profession.name,
      profession,
      change === 'true',
      errors,
    );
  }

  @Post('/:professionId/versions/:versionId/top-level-information')
  @Permissions(UserPermission.CreateProfession)
  @BackLink((request: Request) =>
    request.body.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions',
  )
  async update(
    @Body() topLevelDetailsDto, // unfortunately we can't type this here without a validation error being thrown outside of this
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Req() req: RequestWithAppSession,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    checkCanChangeProfession(req, profession);

    const validator = await Validator.validate(
      TopLevelDetailsDto,
      topLevelDetailsDto,
    );

    const submittedValues = validator.obj;

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      return this.renderForm(
        res,
        submittedValues.name,
        profession,
        submittedValues.change,
        errors,
      );
    }

    const updatedProfession: Profession = {
      ...profession,
      ...{
        name: submittedValues.name,
      },
    };

    await this.professionsService.save(updatedProfession);

    return res.redirect(
      `/admin/professions/${professionId}/versions/${versionId}/check-your-answers`,
    );
  }

  private renderForm(
    res: Response,
    name: string,
    profession: Profession,
    change: boolean,
    errors: object | undefined = undefined,
  ): void {
    const templateArgs: TopLevelDetailsTemplate = {
      name,
      captionText: ViewUtils.captionText(this.i18nService, profession),
      change,
      errors,
    };

    return res.render('admin/professions/top-level-information', templateArgs);
  }
}
