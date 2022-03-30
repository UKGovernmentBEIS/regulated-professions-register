import { Organisation } from '../../organisations/organisation.entity';
import { Profession } from '../profession.entity';
import { TierOneRoles } from './../profession-to-organisation.entity';

export function getTierOneOrganisationsFromProfession(
  profession: Profession,
): Organisation[] {
  return (
    profession.professionToOrganisations
      ?.filter((relation) => TierOneRoles.includes(relation.role))
      ?.map((relation) => relation.organisation)
      .filter((n) => n) || []
  );
}
