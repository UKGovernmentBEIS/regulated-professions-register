import { Organisation } from '../../../organisations/organisation.entity';
import { Profession } from '../../../professions/profession.entity';

export interface DatasetDetailsTemplate {
  profession: Profession;
  organisation: Organisation;
  year: number;
}
