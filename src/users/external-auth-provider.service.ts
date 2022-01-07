type CreateExternalUserResultSuccess = {
  result: 'user-created';
  externalIdentifier: string;
  passwordResetLink: string;
};

type CreateExternalUserResultUserExists = {
  result: 'user-exists';
  externalIdentifier: string;
};

export type CreateExternalUserResult =
  | CreateExternalUserResultSuccess
  | CreateExternalUserResultUserExists;

export abstract class ExternalAuthProviderService {
  public abstract createUser(email: string): Promise<CreateExternalUserResult>;

  public abstract deleteUser(externalIdentifier: string): Promise<void>;
}
