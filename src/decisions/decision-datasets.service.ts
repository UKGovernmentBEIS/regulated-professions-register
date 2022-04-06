import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DecisionDataset } from './decision-dataset.entity';

@Injectable()
export class DecisionDatasetsService {
  constructor(
    @InjectRepository(DecisionDataset)
    private repository: Repository<DecisionDataset>,
  ) {}

  async find(
    professionId: string,
    organisationId: string,
    year: number,
  ): Promise<DecisionDataset> {
    return this.repository.findOne({
      where: {
        profession: { id: professionId },
        organisation: { id: organisationId },
        year,
      },
      relations: ['profession', 'organisation'],
    });
  }

  async save(dataset: DecisionDataset): Promise<DecisionDataset> {
    return this.repository.save(dataset);
  }
}
