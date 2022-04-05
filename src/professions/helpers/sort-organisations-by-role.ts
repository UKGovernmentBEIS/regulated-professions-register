import { Profession } from '../profession.entity';
import {
  ProfessionToOrganisation,
  OrganisationRole,
} from '../profession-to-organisation.entity';

export function sortOrganisationsByRole(
  profession: Profession,
): ProfessionToOrganisation[] {
  const roleOrder = Object.values(OrganisationRole);
  return profession.professionToOrganisations.sort(
    (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role),
  );
}
