import { Organisation } from '../../../organisations/organisation.entity';
import { Profession } from '../../../professions/profession.entity';
import { RouteTemplate } from './route-template.interface';

export interface EditTemplate {
  profession: Profession;
  organisation: Organisation;
  year: number;

  routes: RouteTemplate[];
}
