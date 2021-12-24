import { User } from 'src/users/user.entity';
import { Industry } from '../../industries/industry.entity';
import { Nation } from '../../nations/nation';
import { Organisation } from '../../organisations/organisation.entity';

export interface FilterInput {
  keywords?: string;
  nations?: Nation[];
  organisations?: Organisation[];
  industries?: Industry[];
  changedBy?: User[];
}
