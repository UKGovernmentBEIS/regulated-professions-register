import { Profession } from '../profession.entity';
import {
  TierOneRoles,
  TierOneRoleTypes,
} from './../profession-to-organisation.entity';
import { Organisation } from './../../organisations/organisation.entity';

export type GroupedTierOneOrganisations = Record<
  TierOneRoleTypes,
  Organisation[]
>;

export function getGroupedTierOneOrganisationsFromProfession(
  profession: Profession,
  organisationType: 'latestLiveVersion' | 'latestVersion',
): GroupedTierOneOrganisations {
  const record = {} as GroupedTierOneOrganisations;
  const roleOrder = Object.values(TierOneRoles as ReadonlyArray<string>);

  if (!profession.professionToOrganisations.length) {
    return record;
  }

  // Remove all non-tier one organisations from the relation
  const tierOneRelations = profession.professionToOrganisations.filter(
    (relation) => roleOrder.indexOf(relation.role) > -1,
  );

  // Get the latest version from each organisation and apply it to the relation
  const tierOneRelationsWithVersions = tierOneRelations
    .map((relation) => {
      relation.organisation =
        organisationType === 'latestLiveVersion'
          ? Organisation.withLatestLiveVersion(relation.organisation)
          : Organisation.withLatestVersion(relation.organisation);

      return relation;
    })
    .filter((n) => n.organisation);

  // Sort the relations by role, as defined in `roleOrder`
  const sortedTierOneRelations = tierOneRelationsWithVersions.sort(
    (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role),
  );

  // Group the organisations by their role
  return sortedTierOneRelations.reduce((a, b) => {
    a[b.role] = [...(a[b.role] || []), b.organisation];
    return a;
  }, record);
}
