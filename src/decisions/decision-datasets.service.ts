import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { FilterInput } from '../common/interfaces/filter-input.interface';
import { Organisation } from '../organisations/organisation.entity';
import { Profession } from '../professions/profession.entity';
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

  async all(filter: FilterInput): Promise<DecisionDataset[]> {
    return this.applyFilter(
      this.datasetsWithJoins().where('decisionDataset.status IN(:...status)', {
        status: [
          DecisionDatasetStatus.Live,
          DecisionDatasetStatus.Submitted,
          DecisionDatasetStatus.Draft,
        ],
      }),
      filter,
    )
      .orderBy({
        'profession.name': 'ASC',
        'organisation.name': 'ASC',
        year: 'DESC',
      })
      .getMany();
  }

  async allForOrganisation(
    organisation: Organisation,
    filter: FilterInput,
  ): Promise<DecisionDataset[]> {
    return this.applyFilter(
      this.datasetsWithJoins()
        .where('decisionDataset.status IN(:...status)', {
          status: [
            DecisionDatasetStatus.Live,
            DecisionDatasetStatus.Submitted,
            DecisionDatasetStatus.Draft,
          ],
        })
        .andWhere({
          organisation: { id: organisation.id },
        }),
      filter,
    )
      .orderBy({
        'profession.name': 'ASC',
        'organisation.name': 'ASC',
        year: 'DESC',
      })
      .getMany();
  }

  async allLiveForProfessionAndYear(
    profession: Profession,
    year: number,
  ): Promise<DecisionDataset[]> {
    return this.datasetsWithJoins()
      .where({
        profession: { id: profession.id },
        year,
        status: DecisionDatasetStatus.Live,
      })
      .orderBy({
        'organisation.name': 'ASC',
      })
      .getMany();
  }

  async save(dataset: DecisionDataset): Promise<DecisionDataset> {
    return this.repository.save(dataset);
  }

  async submit(dataset: DecisionDataset): Promise<DecisionDataset> {
    dataset.status = DecisionDatasetStatus.Submitted;

    return this.repository.save(dataset);
  }

  async publish(dataset: DecisionDataset): Promise<DecisionDataset> {
    dataset.status = DecisionDatasetStatus.Live;

    return this.repository.save(dataset);
  }

  private datasetsWithJoins(): SelectQueryBuilder<DecisionDataset> {
    return this.repository
      .createQueryBuilder('decisionDataset')
      .leftJoinAndSelect('decisionDataset.profession', 'profession')
      .leftJoinAndSelect('decisionDataset.organisation', 'organisation')
      .leftJoinAndSelect('decisionDataset.user', 'user');
  }

  private applyFilter(
    query: SelectQueryBuilder<DecisionDataset>,
    filter: FilterInput,
  ): SelectQueryBuilder<DecisionDataset> {
    if (filter.keywords?.length) {
      const keywords = filter.keywords
        .toLowerCase()
        .split(' ')
        .filter((term) => term !== '');

      const keywordMap = keywords.reduce((map, keyword, index) => {
        map[`keyword${index}`] = this.createLikeString(keyword);
        return map;
      }, {});

      const queryString = `(${keywords
        .map((_, index) => `LOWER(profession.name) LIKE :keyword${index}`)
        .join(' OR ')})`;

      query = query.andWhere(queryString, keywordMap);
    }

    if (filter.organisations?.length) {
      const organisations = filter.organisations.map(
        (organisation) => organisation.id,
      );

      query = query.andWhere('organisation.id IN(:...organisations)', {
        organisations,
      });
    }

    if (filter.years?.length) {
      query = query.andWhere('year IN(:...years)', {
        years: filter.years,
      });
    }

    if (filter.statuses?.length) {
      query = query.andWhere('status IN(:...statuses)', {
        statuses: filter.statuses,
      });
    }

    return query;
  }

  private createLikeString(likeString: string): string {
    // TypeORM doesn't escape this for us - see https://github.com/typeorm/typeorm/issues/5012
    return `%${likeString.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
  }
}
