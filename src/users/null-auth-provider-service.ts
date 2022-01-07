import { randomUUID } from 'crypto';
import {
  CreateExternalUserResult,
  ExternalAuthProviderService,
} from './external-auth-provider.service';

export class NullAuthProviderService extends ExternalAuthProviderService {
  public async createUser(): Promise<CreateExternalUserResult> {
    return {
      result: 'user-created',
      externalIdentifier: randomUUID(),
      passwordResetLink: 'http://example.com',
    };
  }
}
