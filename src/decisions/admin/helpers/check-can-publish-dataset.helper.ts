import { UnauthorizedException } from '@nestjs/common';
import { RequestWithAppSession } from '../../../common/interfaces/request-with-app-session.interface';
import { getActingUser } from '../../../users/helpers/get-acting-user.helper';
import { getPermissionsFromUser } from '../../../users/helpers/get-permissions-from-user.helper';
import { UserPermission } from '../../../users/user-permission';

export function checkCanPublishDataset(request: RequestWithAppSession) {
  const user = getActingUser(request);

  if (
    getPermissionsFromUser(user).includes(UserPermission.PublishDecisionData)
  ) {
    return;
  }

  throw new UnauthorizedException();
}
