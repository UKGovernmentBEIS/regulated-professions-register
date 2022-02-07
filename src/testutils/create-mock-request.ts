import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Request } from 'express';

export function createMockRequest(
  referrer: string,
  host: string,
  appSession?: any,
): DeepMocked<Request> {
  const mock = createMock<Request>({
    get: (header) => {
      if (header === 'Referrer') {
        return referrer;
      } else if (header === 'host') {
        return host;
      }
    },
  });

  if (appSession !== undefined) {
    mock['appSession'] = appSession;
  }

  return mock;
}
