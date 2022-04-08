import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecisionsController } from './admin/decisions.controller';
import { DecisionDatasetsService } from './decision-datasets.service';
import { DecisionDataset } from './decision-dataset.entity';
import { Profession } from '../professions/profession.entity';
import { ProfessionsService } from '../professions/professions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DecisionDataset]),
    TypeOrmModule.forFeature([Profession]),
  ],
  providers: [DecisionDatasetsService, ProfessionsService],
  controllers: [DecisionsController],
})
export class DecisionsModule {}
