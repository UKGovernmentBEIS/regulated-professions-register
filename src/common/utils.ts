import { Request } from 'express';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

export function backLink(req: Request): string {
  const referrer = req.get('Referrer') || '';
  const host = req.get('host');

  if (referrer.match('^https?://' + host)) {
    return referrer;
  }
}

export function createMockRequest(
  referrer: string,
  host: string,
): DeepMocked<Request> {
  return createMock<Request>({
    get: (header) => {
      if (header === 'Referrer') {
        return referrer;
      } else if (header === 'host') {
        return host;
      }
    },
  });
}
