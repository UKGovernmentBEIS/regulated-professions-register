import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { User } from '../user.entity';

export function getActingUser(req: RequestWithAppSession): User {
  return req.appSession.user as User;
}
