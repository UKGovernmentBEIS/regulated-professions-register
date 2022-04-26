import { DecisionDatasetStatus } from '../../decisions/decision-dataset.entity';
import { Industry } from '../../industries/industry.entity';
import { Nation } from '../../nations/nation';
import { Organisation } from '../../organisations/organisation.entity';
import { RegulationType } from '../../professions/profession-version.entity';

export interface FilterInput {
  keywords?: string;
  nations?: Nation[];
  organisations?: Organisation[];
  industries?: Industry[];
  regulationTypes?: RegulationType[];
  years?: number[];
  statuses?: DecisionDatasetStatus[];
}
