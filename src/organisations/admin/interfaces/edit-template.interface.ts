import { Organisation } from '../../organisation.entity';
import { SummaryList } from '../../../common/interfaces/summary-list';

export interface EditTemplate {
  organisation: Organisation;
  summaryList: SummaryList;
  professions: {
    name: string;
    slug: string;
    summaryList: SummaryList;
  }[];
  backLink: string;
}
