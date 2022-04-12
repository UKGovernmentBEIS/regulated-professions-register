import { getTierOneOrganisationsFromProfession } from '../../professions/helpers/get-tier-one-organisations-from-profession.helper';
import { Profession } from '../../professions/profession.entity';
import { User } from '../../users/user.entity';

export function belongsToTierOneOrganisation(
  profession: Profession,
  actingUser: User,
) {
  return getTierOneOrganisationsFromProfession(profession).some(
    (organisation) => organisation.id === actingUser.organisation.id,
  );
}
