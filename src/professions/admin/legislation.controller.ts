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
import { Response } from 'express';
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

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class LegislationController {
  constructor(private readonly professionsService: ProfessionsService) {}

  @Get('/:id/legislation/edit')
  @Permissions(UserPermission.CreateProfession)
  async edit(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('change') change: boolean,
  ): Promise<void> {
    const profession = await this.professionsService.find(id);

    this.renderForm(
      res,
      profession.legislation,
      profession.confirmed,
      this.backLink(change, id),
    );
  }

  @Post('/:id/legislation')
  @Permissions(UserPermission.CreateProfession)
  @UseFilters(
    new ValidationExceptionFilter(
      'admin/professions/legislation',
      'legislation',
    ),
  )
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() legislationDto,
    @Query() change: boolean,
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
        this.backLink(change, id),
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
    backLink: string,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const templateArgs: LegislationTemplate = {
      legislation,
      captionText: ViewUtils.captionText(isEditing),
      backLink,
      errors,
    };

    return res.render('admin/professions/legislation', templateArgs);
  }

  private backLink(change: boolean, id: string) {
    return change
      ? `/admin/professions/${id}/check-your-answers`
      : `/admin/professions/${id}/qualification-information/edit`;
  }
}
