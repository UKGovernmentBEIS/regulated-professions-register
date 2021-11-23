import { ManagementClient } from 'auth0';
import { randomUUID } from 'crypto';
import {
  CreateExternalUserResult,
  ExternalUserCreationService,
} from './external-user-creation.service';

/**
 * Service class for creating a new user in Auth0
 */
export class Auth0UserCreationService extends ExternalUserCreationService {
  /**
   * Create a new user in Auth0. The created user will have the provided email
   * address, and a randonly generated password. In the case where a user
   * already exists in Auth0 with the provided email address, no new user will
   * be created, but the Auth0 identifier of the existing user with that email
   * address will be returned
   *
   * @param {string} email The email address of the user to create
   * @returns {Promise<CreateExternalUserResult>} The result of the call,
   *   containing either the Auth0 identifier of the new user, or the Auth0
   *   identifier of the existing user with the provided email address
   */
  public async createExternalUser(
    email: string,
  ): Promise<CreateExternalUserResult> {

    const url = process.env.AUTH0_DOMAIN;
    const domain = url.startsWith('https://') ? url.slice(8) : url;

    const client = new ManagementClient({
      domain,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      scope: 'create:users read:users',
    });

    // As an interaction with an external service, we're unable to wrap this in
    // a transaction with `createUser`, but at least attempt to avoid creating
    // a conflicting user
    const users = await client.getUsersByEmail(email);

    // Since we only support password authentication, assume we either get zero
    // or one users returned
    if (users.length > 0) {
      return { result: 'user-exists', externalIdentifier: users[0].user_id };
    }

    const user = await client.createUser({
      email,
      password: randomUUID(),
      connection: 'Username-Password-Authentication',
    });

    return { result: 'user-created', externalIdentifier: user.user_id };
  }
}
