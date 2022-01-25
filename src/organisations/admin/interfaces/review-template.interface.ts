import { Organisation } from '../../organisation.entity';
import { SummaryList } from '../../../common/interfaces/summary-list';

export interface ReviewTemplate extends Organisation {
  summaryList: SummaryList;
}
