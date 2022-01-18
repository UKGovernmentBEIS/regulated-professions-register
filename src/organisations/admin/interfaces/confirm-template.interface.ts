import { Organisation } from '../../organisation.entity';
import { SummaryList } from '../../../common/interfaces/summary-list';

export interface ConfirmTemplate extends Organisation {
  summaryList: SummaryList;
}
