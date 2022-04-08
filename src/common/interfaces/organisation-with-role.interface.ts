import { Organisation } from '../../organisations/organisation.entity';
import { OrganisationRole } from '../../professions/profession-to-organisation.entity';

export interface OrganisationWithRole extends Organisation {
  role: OrganisationRole;
}
