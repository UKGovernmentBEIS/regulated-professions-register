import { randomUUID } from 'crypto';
import { ManagementClient as Auth0ManagementClient } from 'auth0';

type StubCreateUserResponse = {
  user_id: string;
};

type StubPasswordChangeTicketResponse = {
  ticket: string;
};

class ManagementClientStub {
  async getUsersByEmail(): Promise<Array<any>> {
    return [];
  }

  async createUser(): Promise<StubCreateUserResponse> {
    return {
      user_id: randomUUID(),
    };
  }

  async createPasswordChangeTicket(): Promise<StubPasswordChangeTicketResponse> {
    return {
      ticket: 'http://example.com',
    };
  }

  async deleteUser(): Promise<null> {
    return null;
  }
}

export const ManagementClient =
  process.env.NODE_ENV === 'test'
    ? ManagementClientStub
    : Auth0ManagementClient;
