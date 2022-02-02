import { Response, NextFunction } from 'express';
import { RequestWithAppSession } from './interfaces/request-with-app-session.interface';
import { User } from './../users/user.entity';

export function globalLocals(
  req: RequestWithAppSession,
  res: Response,
  next: NextFunction,
): void {
  const user = req.appSession.user as User;

  res.app.locals.isLoggedin = user !== undefined;
  res.app.locals.user = user;
  res.app.locals.currentUrl = req.originalUrl;
  res.app.locals.infoMessages = req.flash('info');
  res.app.locals.successMessages = req.flash('success');

  next();
}
