import { DecisionDatasetStatus } from '../../decision-dataset.entity';

export class FilterDto {
  keywords = '';
  organisations?: string[] = [];
  years: string[] = [];
  statuses: DecisionDatasetStatus[] = [];
  professions?: string[] = [];
}
