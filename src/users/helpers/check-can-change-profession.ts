import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { Profession } from '../../professions/profession.entity';
import { getActingUser } from './get-acting-user.helper';
import { UnauthorizedException } from '@nestjs/common';
import { canChangeProfession } from './can-change-profession';

export function checkCanChangeProfession(
  request: RequestWithAppSession,
  profession: Profession,
) {
  const actingUser = getActingUser(request);

  if (!canChangeProfession(actingUser, profession)) {
    throw new UnauthorizedException();
  }
}
