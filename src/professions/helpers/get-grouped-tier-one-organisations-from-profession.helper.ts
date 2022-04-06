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
): GroupedTierOneOrganisations {
  const record = {} as GroupedTierOneOrganisations;
  const roleOrder = Object.values(TierOneRoles as ReadonlyArray<string>);

  if (!profession.professionToOrganisations.length) {
    return record;
  }

  const tierOneRelations = profession.professionToOrganisations.filter(
    (relation) => roleOrder.indexOf(relation.role) > -1,
  );

  const sortedTierOneRelations = tierOneRelations
    .sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role))
    .filter((n) => n);

  return sortedTierOneRelations.reduce((a, b) => {
    a[b.role] = [...(a[b.role] || []), b.organisation];
    return a;
  }, record);
}
