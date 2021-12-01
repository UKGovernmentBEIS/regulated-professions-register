import { randomUUID } from 'crypto';
import {
  CreateExternalUserResult,
  ExternalUserCreationService,
} from './external-user-creation.service';

export class NullUserCreationService extends ExternalUserCreationService {
  public async createExternalUser(): Promise<CreateExternalUserResult> {
    return { result: 'user-created', externalIdentifier: randomUUID() };
  }
}
