import { Profession } from '../../professions/profession.entity';
import { getTierOneOrganisationsFromProfession } from '../../professions/helpers/get-tier-one-organisations-from-profession.helper';
import { User } from '../../users/user.entity';

export function canChangeProfession(
  actingUser: User,
  profession: Profession,
): boolean {
  if (actingUser.serviceOwner) {
    return true;
  }

  return getTierOneOrganisationsFromProfession(profession).some(
    (organisation) => organisation.id === actingUser.organisation.id,
  );
}
