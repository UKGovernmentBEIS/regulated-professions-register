import { RegulationType } from '../../profession-version.entity';
import { ProfessionSortMethod } from '../../profession-versions.service';

export class FilterDto {
  keywords = '';
  nations: string[] = [];
  organisations?: string[] = [];
  industries?: string[] = [];
  regulationTypes?: RegulationType[] = [];
  sortBy?: ProfessionSortMethod = null;
}
