import { Response, NextFunction } from 'express';
import { RequestWithAppSession } from './interfaces/request-with-app-session.interface';
import { getPermissionsFromUser } from '../users/helpers/get-permissions-from-user.helper';
import { getActingUser } from '../users/helpers/get-acting-user.helper';

export function globalLocals(
  req: RequestWithAppSession,
  res: Response,
  next: NextFunction,
): void {
  const user = getActingUser(req);

  res.app.locals.isLoggedin = user !== undefined;
  res.app.locals.user = user;
  res.app.locals.permissions = user && getPermissionsFromUser(user);
  res.app.locals.currentUrl = req.originalUrl;
  res.app.locals.infoMessages = req.flash('info');
  res.app.locals.successMessages = req.flash('success');

  next();
}
