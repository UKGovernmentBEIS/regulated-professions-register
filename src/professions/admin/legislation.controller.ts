import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Permissions } from '../../common/permissions.decorator';
import { Validator } from '../../helpers/validator';
import { Legislation } from '../../legislations/legislation.entity';
import { UserPermission } from '../../users/user.entity';
import { ValidationExceptionFilter } from '../../common/validation/validation-exception.filter';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { ProfessionsService } from '../professions.service';
import LegislationDto from './dto/legislation.dto';
import { LegislationTemplate } from './interfaces/legislation.template';
import ViewUtils from './viewUtils';
import { BackLink } from '../../common/decorators/back-link.decorator';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class LegislationController {
  constructor(private readonly professionsService: ProfessionsService) {}

  @Get('/:professionId/versions/:versionId/legislation/edit')
  @Permissions(UserPermission.CreateProfession)
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
  ): Promise<void> {
    const profession = await this.professionsService.find(professionId);

    this.renderForm(res, profession.legislation, profession.confirmed);
  }

  @Post('/:professionId/versions/:versionId/legislation')
  @Permissions(UserPermission.CreateProfession)
  @UseFilters(
    new ValidationExceptionFilter(
      'admin/professions/legislation',
      'legislation',
    ),
  )
  @BackLink((request: Request) =>
    request.query.change === 'true'
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

    const profession = await this.professionsService.find(professionId);

    const submittedValues: LegislationDto = legislationDto;

    const updatedLegislation: Legislation = {
      ...profession.legislation,
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
        profession.confirmed,
        errors,
      );
    }

    profession.legislation = updatedLegislation;

    await this.professionsService.save(profession);

    res.redirect(
      `/admin/professions/${professionId}/versions/${versionId}/check-your-answers`,
    );
  }

  private async renderForm(
    res: Response,
    legislation: Legislation,
    isEditing: boolean,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const templateArgs: LegislationTemplate = {
      legislation,
      captionText: ViewUtils.captionText(isEditing),
      errors,
    };

    return res.render('admin/professions/legislation', templateArgs);
  }
}
