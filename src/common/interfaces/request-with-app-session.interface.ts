import { Request } from 'express';

export interface RequestWithAppSession extends Request {
  appSession: any;
}
