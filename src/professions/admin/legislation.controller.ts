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

  @Get('/:id/legislation/edit')
  @Permissions(UserPermission.CreateProfession)
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/professions/:id/check-your-answers'
      : '/admin/professions/:id/qualification-information/edit',
  )
  async edit(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('change') change: boolean,
  ): Promise<void> {
    const profession = await this.professionsService.find(id);

    this.renderForm(res, profession.legislation, profession.confirmed, change);
  }

  @Post('/:id/legislation')
  @Permissions(UserPermission.CreateProfession)
  @UseFilters(
    new ValidationExceptionFilter(
      'admin/professions/legislation',
      'legislation',
    ),
  )
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/professions/:id/check-your-answers'
      : '/admin/professions/:id/qualification-information/edit',
  )
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() legislationDto,
  ): Promise<void> {
    const validator = await Validator.validate(LegislationDto, legislationDto);

    const profession = await this.professionsService.find(id);

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
        submittedValues.change,
        errors,
      );
    }

    profession.legislation = updatedLegislation;

    await this.professionsService.save(profession);

    res.redirect(`/admin/professions/${id}/check-your-answers`);
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
