import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profession } from './profession.entity';
import { ProfessionsService } from './professions.service';
import { ProfessionsController } from './professions.controller';
import { TopLevelInformationController } from './admin/add-profession/top-level-information.controller';
import { IndustriesService } from '../industries/industries.service';
import { Industry } from '../industries/industry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profession]),
    TypeOrmModule.forFeature([Industry]),
  ],
  providers: [ProfessionsService, IndustriesService],
  controllers: [ProfessionsController, TopLevelInformationController],
})
export class ProfessionsModule {}
