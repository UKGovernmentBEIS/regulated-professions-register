import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Render,
  Res,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { Request } from 'express';

import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { Validator } from '../../helpers/validator';
import { UsersService } from '../users.service';
import { UserPermission } from './../user.entity';
import { PersonalDetailsDto } from './dto/personal-details.dto';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Permissions } from '../../common/permissions.decorator';
import { EditTemplate } from './interfaces/edit-template';
import { BackLink } from '../../common/decorators/back-link.decorator';
@Controller('/admin/users')
@UseGuards(AuthenticationGuard)
export class PersonalDetailsController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/personal-details/edit')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @Render('admin/users/personal-details/edit')
  @BackLink('/admin/users')
  async edit(
    @Req() req: Request,
    @Param('id') id,
    @Query('change') change: boolean,
  ): Promise<EditTemplate> {
    const user = await this.usersService.find(id);

    return {
      ...user,
      change: change,
    };
  }

  @Post(':id/personal-details')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  async create(
    @Body() personalDetailsDto,
    @Res() res,
    @Param('id') id,
  ): Promise<void> {
    // Intentially don't use `ValidationExceptionFilter`, as we have additional
    // parameters to get into our template
    const validator = await Validator.validate(
      PersonalDetailsDto,
      personalDetailsDto,
    );

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      this.renderWithErrors(res, personalDetailsDto, errors);
      return;
    }

    // Don't talk to Auth0 yet, but at least check our own DB
    if (await this.usersService.findByEmail(personalDetailsDto.email)) {
      const errors = {
        email: { text: 'A user with this email address already exists' },
      };

      this.renderWithErrors(res, personalDetailsDto, errors);
      return;
    }

    const user = await this.usersService.find(id);
    const updated = Object.assign(user, personalDetailsDto);

    await this.usersService.save(updated);

    if (personalDetailsDto.change) {
      res.redirect(`/admin/users/${id}/confirm`);
    } else {
      res.redirect(`/admin/users/${id}/permissions/edit`);
    }
  }

  private renderWithErrors(
    res: any,
    personalDetailsDto: PersonalDetailsDto,
    errors: object,
  ): void {
    res.render('admin/users/personal-details/edit', {
      name: personalDetailsDto.name,
      email: personalDetailsDto.email,
      errors,
    });
  }
}
