import { Organisation } from '../../organisations/organisation.entity';
import { Profession } from '../profession.entity';
import { ProfessionToOrganisation } from './../profession-to-organisation.entity';

export function getOrganisationsFromProfession(
  profession: Profession,
): Organisation[] {
  return (
    profession.professionToOrganisations
      ?.map((relation: ProfessionToOrganisation) => relation.organisation)
      .filter((n) => n) || []
  );
}
