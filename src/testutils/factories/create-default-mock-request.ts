import { DeepMocked } from '@golevelup/ts-jest';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { createMockRequest } from '../create-mock-request';

export function createDefaultMockRequest(
  appSession?: any,
): DeepMocked<RequestWithAppSession> {
  return createMockRequest(
    'http://example.com/some/path',
    'example.com',
    appSession,
  );
}
