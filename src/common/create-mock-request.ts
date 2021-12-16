import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Request } from 'express';

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
