import { Organisation } from '../../organisations/organisation.entity';
import { Profession } from '../profession.entity';

export function getOrganisationsFromProfession(
  profession: Profession,
): Organisation[] {
  const organisation = profession.organisation;
  const additionalOrganisation = profession.additionalOrganisation;

  const result: Organisation[] = [];

  if (organisation) {
    result.push(organisation);
  }

  if (additionalOrganisation) {
    result.push(additionalOrganisation);
  }

  return result;
}
