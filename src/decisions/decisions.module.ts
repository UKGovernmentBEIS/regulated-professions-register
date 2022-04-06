import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecisionsController } from './admin/decisions.controller';
import { DecisionDatasetsService } from './decision-datasets.service';
import { DecisionDataset } from './decision-dataset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DecisionDataset])],
  providers: [DecisionDatasetsService],
  controllers: [DecisionsController],
})
export class DecisionsModule {}
