import { RegulationType } from '../../profession-version.entity';

export class FilterDto {
  keywords = '';
  nations: string[] = [];
  industries: string[] = [];
  regulationTypes: RegulationType[] = [];
}
