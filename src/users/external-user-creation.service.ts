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

export abstract class ExternalUserCreationService {
  public abstract createExternalUser(
    email: string,
  ): Promise<CreateExternalUserResult>;
}
