import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectData } from '../common/decorators/seeds.decorator';
import { Organisation } from '../organisations/organisation.entity';
import { DecisionDataset, DecisionStatus } from './decision-dataset.entity';
import { Profession } from '../professions/profession.entity';
import { DecisionRoute } from './interfaces/decision-route.interface';

type SeedDecisionDataset = {
  profession: string;
  organisation: string;
  year: number;
  status: DecisionStatus;
  routes: DecisionRoute[];
};

@Injectable()
export class DecisionDatasetsSeeder implements Seeder {
  @InjectData('decision-datasets')
  data: SeedDecisionDataset[];

  constructor(
    @InjectRepository(DecisionDataset)
    private readonly decisionDatasetsRepository: Repository<DecisionDataset>,
    @InjectRepository(Profession)
    private readonly professionsRepository: Repository<Profession>,
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
  ) {}

  async seed(): Promise<void> {
    await Promise.all(
      this.data.map(async (seedDataset) => {
        const profession = await this.professionsRepository.findOne({
          where: { name: seedDataset.profession },
        });

        const organisation = await this.organisationRepository.findOne({
          where: { name: seedDataset.organisation },
        });

        const dataset: DecisionDataset = {
          profession,
          organisation,
          year: seedDataset.year,
          status: seedDataset.status,
          routes: seedDataset.routes,
          user: null,
          created_at: undefined,
          updated_at: undefined,
        };

        await this.decisionDatasetsRepository.save(dataset);
      }),
    );
  }

  async drop(): Promise<any> {
    // Deletion of decisions is handled in `ProfessionsSeeder`
  }
}
