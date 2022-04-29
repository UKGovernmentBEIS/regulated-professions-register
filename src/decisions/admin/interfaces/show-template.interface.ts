import { Table } from '../../../common/interfaces/table';
import { Organisation } from '../../../organisations/organisation.entity';
import { Profession } from '../../../professions/profession.entity';
import { DecisionDatasetStatus } from '../../decision-dataset.entity';

export interface ShowTemplate {
  profession: Profession;
  organisation: Organisation;
  year: number;
  datasetStatus: DecisionDatasetStatus;
  isPublished: boolean;
  tables: Table[];
  changedBy: { name: string; email: string };
  lastModified: string;
}
