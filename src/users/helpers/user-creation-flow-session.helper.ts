import { UserCreationFlowSessionDto } from '../dto/user-creation-flow-session.dto';

const sessionKey = 'user-creation-flow';

export enum UserCreationFlowStep {
  None,
  PersonalDetails,
  AllDetailsEntered,
  UserCreated,
  Any,
}

/**
 * Helper class for handling session data during the user creation flow.
 * Provides checking that the session data is as expected for a given completed
 * step in the user creation flow
 */
export class UserCreationFlowSession {
  /**
   * Create a new instance of `UserCreationFlowSession`, and validates that
   * the provided session data is valid for the provided completed flow step
   *
   * @param {any} rawSession The raw session data as provided to a NestJS
   *   controller
   * @param {UserCreationFlowStep} step The completed flow step to validate
   *   against
   *
   * @throws
   */
  constructor(private readonly rawSession: any, step: UserCreationFlowStep) {
    if (!rawSession[sessionKey]) {
      rawSession[sessionKey] = new UserCreationFlowSessionDto();

      this.resetSession();
    }

    this.validateSessionForStep(step);
  }

  /**
   * Provides access to session data specifically for the user creation flow.
   * Modify the returned object to modify stored session data
   *
   * @returns {UserCreationFlowSession} Session data specifically for the user
   *   creation flow
   */
  get sessionDto(): UserCreationFlowSessionDto {
    return this.rawSession[sessionKey];
  }

  /**
   * Check if the session data is as expected, assuming the provided step of
   * user creation has been completed
   *
   * @param step {UserCreationFlowStep} The step we want to check has been
   *   completed
   * @returns {boolean} `true` if the session is valid for a given completed
   *   step, `false` otherwise
   */
  hasCompletedStep(step: UserCreationFlowStep): boolean {
    if (step === UserCreationFlowStep.Any) {
      return true;
    }

    if (
      (step == UserCreationFlowStep.UserCreated) !==
      !!this.sessionDto.userCreated
    ) {
      return false;
    }

    if (step >= UserCreationFlowStep.PersonalDetails) {
      if (!this.sessionDto.name || !this.sessionDto.email) {
        return false;
      }
    }

    return true;
  }

  /**
   * Reset the session data for the user creation flow to its default starting
   * state. Folllowing this, the session will be valid only for steps `None`
   * and `Any`
   */
  resetSession(): void {
    this.sessionDto.name = undefined;
    this.sessionDto.email = undefined;
    this.sessionDto.userCreated = false;
  }

  private validateSessionForStep(step: UserCreationFlowStep): void {
    if (!this.hasCompletedStep(step)) {
      throw new Error(`Invalid session for step ${step}`);
    }
  }
}
