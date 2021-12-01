import { UserCreationFlowSessionDto } from '../dto/user-creation-flow-session.dto';

const sessionKey = 'user-creation-flow';

export enum UserCreationFlowStep {
  Start,
  PersonalDetails,
  Complete,
}

export class UserCreationFlowSession {
  constructor(private readonly rawSession: any, step: UserCreationFlowStep) {
    if (!rawSession[sessionKey]) {
      rawSession[sessionKey] = new UserCreationFlowSessionDto();
    }

    this.validateSessionForStep(step);
  }

  get sessionDto(): UserCreationFlowSessionDto {
    return this.rawSession[sessionKey];
  }

  hasCompletedStep(step: UserCreationFlowStep): boolean {
    if (
      step == UserCreationFlowStep.PersonalDetails ||
      step == UserCreationFlowStep.Complete
    ) {
      return !!(this.sessionDto.name && this.sessionDto.email);
    } else {
      return true;
    }
  }

  clearSession(): void {
    this.rawSession[sessionKey] = new UserCreationFlowSessionDto();
  }

  private validateSessionForStep(step: UserCreationFlowStep): void {
    if (!this.hasCompletedStep(step)) {
      throw new Error(`Step ${step} has not been completed in this session`);
    }
  }
}
