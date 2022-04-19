import { Table } from '../../../common/interfaces/table';
import { Organisation } from '../../../organisations/organisation.entity';
import { Profession } from '../../../professions/profession.entity';

export interface ShowTemplate {
  profession: Profession;
  organisation: Organisation;
  year: number;
  tables: Table[];
}
