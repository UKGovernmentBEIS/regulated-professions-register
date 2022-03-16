import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { Organisation } from '../../organisations/organisation.entity';
import { getActingUser } from './get-acting-user.helper';

export function checkCanViewOrganisation(
  request: RequestWithAppSession,
  organisation?: Organisation | null,
): void {
  const actingUser = getActingUser(request);

  if (
    actingUser.serviceOwner ||
    actingUser.organisation.id === organisation?.id
  ) {
    return;
  }

  throw new UnauthorizedException();
}
