import {
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Session,
} from '@nestjs/common';
import { IndustriesService } from '../../../industries/industries.service';
import { Qualification } from '../../../qualifications/qualification.entity';
import { Profession } from '../../profession.entity';

import { ProfessionsService } from '../../professions.service';

@Controller('admin/professions/new/confirmation')
export class ConfirmationController {
  constructor(
    private professionsService: ProfessionsService,
    private industriesService: IndustriesService,
  ) {}

  @Post()
  @Redirect('/admin/professions/new/confirmation')
  async create(@Session() session: Record<string, any>) {
    const addProfessionSession = session['add-profession'];
    const topLevelDetails = addProfessionSession['top-level-details'];

    const industry = await this.industriesService.find(
      topLevelDetails.industryId,
    );

    const profession = new Profession(
      topLevelDetails.name,
      '',
      '',
      topLevelDetails.nation,
      '',
      industry,
      new Qualification(),
      [],
      [],
    );

    this.professionsService.create(profession);
  }

  @Get()
  @Render('professions/admin/add-profession/confirmation')
  async viewConfirmation(@Session() session: Record<string, any>) {
    const addProfessionSession = session['add-profession'];

    return { name: addProfessionSession['top-level-details'].name };
  }
}
