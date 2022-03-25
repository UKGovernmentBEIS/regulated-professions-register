import { ManagementClient } from './auth0-management-client';
import { PerformNowOrLater } from '../common/interfaces/perform-now-or-later';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { randomUUID } from 'crypto';

type CreateExternalUserResultSuccess = {
  result: 'user-created';
  externalIdentifier: string;
  passwordResetLink: string;
};

type CreateExternalUserResultUserExists = {
  result: 'user-exists';
  externalIdentifier: string;
};

type CreateExternalUserResult =
  | CreateExternalUserResultSuccess
  | CreateExternalUserResultUserExists;

/**
 * Service class for interacting with Auth0
 */
export class Auth0Service {
  constructor(@InjectQueue('auth0') private queue: Queue) {}

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
  public async createUser(email: string): Promise<CreateExternalUserResult> {
    const client = this.getClient();

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
      email_verified: true,
      connection: 'Username-Password-Authentication',
    });

    const passwordChangeTicket = await client.createPasswordChangeTicket({
      result_url: `${process.env['HOST_URL']}/admin`,
      user_id: user.user_id,
      ttl_sec: 1209600,
    });

    return {
      result: 'user-created',
      externalIdentifier: user.user_id,
      passwordResetLink: passwordChangeTicket.ticket,
    };
  }

  public deleteUser(externalIdentifier: string): PerformNowOrLater {
    return {
      performNow: async () => {
        const client = this.getClient();
        return await client.deleteUser({ id: externalIdentifier });
      },
      performLater: async () => {
        return await this.queue.add('deleteUser', {
          externalIdentifier: externalIdentifier,
        });
      },
    };
  }

  private getClient() {
    const url = process.env['AUTH0_DOMAIN'];
    const domain = url.startsWith('https://') ? url.slice(8) : url;

    return new ManagementClient({
      domain,
      clientId: process.env['AUTH0_CLIENT_ID'],
      clientSecret: process.env['AUTH0_CLIENT_SECRET'],
      scope: 'create:users read:users create:user_tickets delete:users',
    });
  }
}
