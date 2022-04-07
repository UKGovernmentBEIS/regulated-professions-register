import { Profession } from '../profession.entity';
import { OrganisationRole } from './../profession-to-organisation.entity';
import { Organisation } from './../../organisations/organisation.entity';

export function getOrganisationsFromProfessionByRole(
  profession: Profession,
  role: OrganisationRole,
  organisationType: 'latestLiveVersion' | 'latestVersion',
): Organisation[] {
  return profession.professionToOrganisations
    .filter((relation) => relation.role === role)
    .map((relation) =>
      organisationType === 'latestLiveVersion'
        ? Organisation.withLatestLiveVersion(relation.organisation)
        : Organisation.withLatestVersion(relation.organisation),
    )
    .filter((n) => n);
}
