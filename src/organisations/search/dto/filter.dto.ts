import { RegulationType } from '../../../professions/profession-version.entity';

export class FilterDto {
  keywords = '';
  nations: string[] = [];
  industries: string[] = [];
  regulationTypes: RegulationType[] = [];
}
