import { DatasetDetailsTemplate } from '../dataset-details-template.interface';

export interface NewTemplate extends DatasetDetailsTemplate {
  datasetPublished: boolean;
}
