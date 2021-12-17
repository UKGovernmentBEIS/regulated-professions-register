import {
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Session,
} from '@nestjs/common';
import { IndustriesService } from '../../../industries/industries.service';
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
  async confirm(@Session() session: Record<string, any>) {
    const draftProfession = await this.fetchProfessionOrThrow(session);

    this.professionsService.confirm(draftProfession);
  }

  @Get()
  @Render('professions/admin/add-profession/confirmation')
  async viewConfirmation(@Session() session: Record<string, any>) {
    const profession = await this.fetchProfessionOrThrow(session);

    session['profession-id'] = undefined;

    return { name: profession.name };
  }

  private async fetchProfessionOrThrow(
    session: Record<string, any>,
  ): Promise<Profession> {
    const professionId = session['profession-id'];

    if (professionId === undefined) {
      throw new Error();
    }

    const profession = await this.professionsService.find(professionId);

    if (!profession) {
      throw new Error('Draft profession not found');
    }

    return profession;
  }
}
