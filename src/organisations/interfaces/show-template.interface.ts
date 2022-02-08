import { Organisation } from '../organisation.entity';
import { SummaryList } from '../../common/interfaces/summary-list';

export interface ShowTemplate {
  organisation: Organisation;
  summaryList: SummaryList;
  professions: {
    name: string;
    slug: string;
    id: string;
    versionId: string;
    summaryList: SummaryList;
  }[];
}
