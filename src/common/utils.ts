import { Request } from 'express';

export function backLink(req: Request): string {
  const referrer = req.get('Referrer') || '';
  const host = req.get('host');

  if (referrer.match('^https?://' + host)) {
    return referrer;
  }
}
