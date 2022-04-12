import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { Profession } from '../../professions/profession.entity';
import { getActingUser } from './get-acting-user.helper';
import { belongsToTierOneOrganisation } from './belongs-to-tier-one-organisation';
import { UnauthorizedException } from '@nestjs/common';

export function checkCanViewProfession(
  request: RequestWithAppSession,
  profession: Profession,
) {
  const actingUser = getActingUser(request);

  if (actingUser.serviceOwner) {
    return;
  }

  if (!belongsToTierOneOrganisation(profession, actingUser)) {
    throw new UnauthorizedException();
  }
}
