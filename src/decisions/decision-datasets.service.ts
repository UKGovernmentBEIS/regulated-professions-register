import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Organisation } from '../organisations/organisation.entity';
import {
  DecisionDataset,
  DecisionDatasetStatus,
} from './decision-dataset.entity';

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
      relations: ['profession', 'organisation', 'user'],
    });
  }

  async all(): Promise<DecisionDataset[]> {
    return this.datasetsWithJoins()
      .where('decisionDataset.status IN(:...status)', {
        status: [DecisionDatasetStatus.Live, DecisionDatasetStatus.Draft],
      })
      .orderBy({
        'profession.name': 'ASC',
        'organisation.name': 'ASC',
        year: 'DESC',
      })
      .getMany();
  }

  async allForOrganisation(
    organisation: Organisation,
  ): Promise<DecisionDataset[]> {
    return this.datasetsWithJoins()
      .where('decisionDataset.status IN(:...status)', {
        status: [DecisionDatasetStatus.Live, DecisionDatasetStatus.Draft],
      })
      .andWhere({
        organisation: { id: organisation.id },
      })
      .orderBy({
        'profession.name': 'ASC',
        'organisation.name': 'ASC',
        year: 'DESC',
      })
      .getMany();
  }

  async save(dataset: DecisionDataset): Promise<DecisionDataset> {
    return this.repository.save(dataset);
  }

  private datasetsWithJoins(): SelectQueryBuilder<DecisionDataset> {
    return this.repository
      .createQueryBuilder('decisionDataset')
      .leftJoinAndSelect('decisionDataset.profession', 'profession')
      .leftJoinAndSelect('decisionDataset.organisation', 'organisation')
      .leftJoinAndSelect('decisionDataset.user', 'user');
  }
}
