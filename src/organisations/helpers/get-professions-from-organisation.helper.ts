import { Organisation } from '../../organisations/organisation.entity';
import { Profession } from './../../professions/profession.entity';
import { ProfessionToOrganisation } from './../../professions/profession-to-organisation.entity';

export function getProfessionsFromOrganisation(
  organisation: Organisation,
): Profession[] {
  return organisation.professionToOrganisations
    ?.map((relation: ProfessionToOrganisation) => relation.profession)
    .filter((n) => n);
}
