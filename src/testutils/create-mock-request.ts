import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RequestWithAppSession } from '../common/interfaces/request-with-app-session.interface';

export function createMockRequest(
  referrer: string,
  host: string,
  appSession?: any,
): DeepMocked<RequestWithAppSession> {
  const mock = createMock<RequestWithAppSession>({
    get: (header) => {
      if (header === 'Referrer') {
        return referrer;
      } else if (header === 'host') {
        return host;
      }
    },
  });

  if (appSession !== undefined) {
    mock.appSession = appSession;
  }

  return mock;
}
