import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { Profession } from '../../professions/profession.entity';
import { getActingUser } from './get-acting-user.helper';
import { getTierOneOrganisationsFromProfession } from '../../professions/helpers/get-tier-one-organisations-from-profession.helper';
import { UnauthorizedException } from '@nestjs/common';

export function checkCanChangeProfession(
  request: RequestWithAppSession,
  profession: Profession,
) {
  const actingUser = getActingUser(request);

  if (actingUser.serviceOwner) {
    return;
  }

  const belongsToTierOneOrganisation = getTierOneOrganisationsFromProfession(
    profession,
  ).some((organisation) => organisation.id === actingUser.organisation.id);

  if (!belongsToTierOneOrganisation) {
    throw new UnauthorizedException();
  }
}
