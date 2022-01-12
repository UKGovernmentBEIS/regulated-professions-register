import { Request, Response, NextFunction } from 'express';
import { User } from './../users/user.entity';

export interface RequestWithAppSession extends Request {
  appSession: any;
}

export function globalLocals(
  req: RequestWithAppSession,
  res: Response,
  next: NextFunction,
): void {
  const user = req.appSession.user as User;

  res.app.locals.isLoggedin = user !== undefined;
  res.app.locals.user = user;

  next();
}
