import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { User } from '../user.entity';
import { checkCanViewOrganisation } from './check-can-view-organisation';

export function checkCanViewUser(request: RequestWithAppSession, user: User) {
  checkCanViewOrganisation(request, user.organisation);
}
