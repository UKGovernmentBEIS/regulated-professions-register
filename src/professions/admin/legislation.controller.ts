import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Permissions } from '../../common/permissions.decorator';
import { Validator } from '../../helpers/validator';
import { Legislation } from '../../legislations/legislation.entity';
import { UserPermission } from '../../users/user-permission';
import { ValidationExceptionFilter } from '../../common/validation/validation-exception.filter';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { ProfessionsService } from '../professions.service';
import LegislationDto from './dto/legislation.dto';
import { LegislationTemplate } from './interfaces/legislation.template';
import ViewUtils from './viewUtils';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { ProfessionVersionsService } from '../profession-versions.service';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class LegislationController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
  ) {}

  @Get('/:professionId/versions/:versionId/legislation/edit')
  @Permissions(UserPermission.EditProfession)
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId/qualification-information/edit',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('versionId') versionId: string,
    @Query('change') change: boolean,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    // We currently only show one legislation here, but we'll be showing multiple in future
    this.renderForm(
      res,
      version.legislations[0],
      profession.slug !== null,
      change,
    );
  }

  @Post('/:professionId/versions/:versionId/legislation')
  @Permissions(UserPermission.EditProfession)
  @UseFilters(
    new ValidationExceptionFilter(
      'admin/professions/legislation',
      'legislation',
    ),
  )
  @BackLink((request: Request) =>
    request.body.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId/qualification-information/edit',
  )
  async update(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Body() legislationDto,
  ): Promise<void> {
    const validator = await Validator.validate(LegislationDto, legislationDto);

    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    const submittedValues: LegislationDto = legislationDto;

    const updatedLegislation: Legislation = {
      // We currently need to update one legislation here, but will update multiple in future
      ...version.legislations[0],
      ...{
        name: submittedValues.nationalLegislation,
        url: submittedValues.link,
      },
    };

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();

      return this.renderForm(
        res,
        updatedLegislation,
        profession.slug !== null,
        submittedValues.change,
        errors,
      );
    }

    version.legislations = [updatedLegislation];

    await this.professionVersionsService.save(version);

    res.redirect(
      `/admin/professions/${professionId}/versions/${versionId}/check-your-answers`,
    );
  }

  private async renderForm(
    res: Response,
    legislation: Legislation,
    isEditing: boolean,
    change: boolean,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const templateArgs: LegislationTemplate = {
      legislation,
      captionText: ViewUtils.captionText(isEditing),
      change,
      errors,
    };

    return res.render('admin/professions/legislation', templateArgs);
  }
}
