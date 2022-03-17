import { RegulationType } from '../../profession-version.entity';

export class FilterDto {
  keywords = '';
  nations: string[] = [];
  organisations?: string[] = [];
  industries?: string[] = [];
  regulationTypes?: RegulationType[] = [];
}
