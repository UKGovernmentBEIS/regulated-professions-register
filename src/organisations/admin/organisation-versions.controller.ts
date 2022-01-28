import {
  Controller,
  UseGuards,
  Get,
  Render,
  Param,
  Post,
  Res,
  Req,
} from '@nestjs/common';
import { Response } from 'express';

import { BackLink } from '../../common/decorators/back-link.decorator';

import { AuthenticationGuard } from '../../common/authentication.guard';

import { OrganisationsService } from '../organisations.service';
import { OrganisationVersionsService } from '../organisation-versions.service';

import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';

import { OrganisationVersion } from '../organisation-version.entity';

@UseGuards(AuthenticationGuard)
@Controller('/admin/organisations')
export class OrganisationVersionsController {
  constructor(
    private readonly organisationsService: OrganisationsService,
    private readonly organisationsVersionsService: OrganisationVersionsService,
  ) {}

  @Get('/:organisationID/versions/new')
  @Render('admin/organisations/versions/new')
  @BackLink('/admin/organisations')
  async new(@Param('organisationID') organisationID: string) {
    const organisation = await this.organisationsService.find(organisationID);

    return organisation;
  }
}
