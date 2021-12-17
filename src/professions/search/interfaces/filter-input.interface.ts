import { Industry } from '../../../industries/industry.entity';
import { Nation } from '../../../nations/nation';

export interface FilterInput {
  nations: Nation[];
  industries: Industry[];
  keywords: string;
}
