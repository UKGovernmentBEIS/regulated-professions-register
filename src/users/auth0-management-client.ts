import { randomUUID } from 'crypto';
import { ManagementClient as Auth0ManagementClient } from 'auth0';

type StubCreateUserResponse = {
  data: {
    user_id: string;
  };
};

type StubPasswordChangeTicketResponse = {
  data: {
    ticket: string;
  };
};

type StubUsersByEmailResponse = {
  data: Array<any>;
};

class ManagementClientStub {
  readonly users: UsersManagerStub;
  readonly usersByEmail: UsersByEmailManagerStub;
  readonly tickets: TicketsManagerStub;

  async deleteUser(): Promise<null> {
    return null;
  }
}

class UsersManagerStub {
  async create(): Promise<StubCreateUserResponse> {
    return {
      data: {
        user_id: randomUUID(),
      },
    };
  }

  async delete(): Promise<null> {
    return null;
  }
}

class UsersByEmailManagerStub {
  async getByEmail(): Promise<StubUsersByEmailResponse> {
    return {
      data: [],
    };
  }
}

class TicketsManagerStub {
  async changePassword(): Promise<StubPasswordChangeTicketResponse> {
    return {
      data: {
        ticket: 'http://example.com',
      },
    };
  }
}

export const ManagementClient =
  process.env.NODE_ENV === 'test'
    ? ManagementClientStub
    : Auth0ManagementClient;
