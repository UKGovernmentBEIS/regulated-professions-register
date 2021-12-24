import { format } from 'date-fns';
import { Request } from 'express';

export function backLink(req: Request): string {
  const referrer = req.get('Referrer') || '';
  const host = req.get('host');

  if (referrer.match('^https?://' + host)) {
    return referrer;
  }
}

export function formatDate(date: Date): string {
  return format(date, 'dd-MM-yyyy');
}
