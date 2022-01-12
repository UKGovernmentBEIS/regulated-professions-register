import { RadioButtonArgs } from '../../../../common/interfaces/radio-button-args.interface';

export interface QualificationInformationTemplate {
  level: string;
  methodToObtainQualificationRadioButtonArgs: RadioButtonArgs[];
  mostCommonPathToObtainQualificationRadioButtonArgs: RadioButtonArgs[];
  duration: string;
  mandatoryProfessionalExperienceRadioButtonArgs: RadioButtonArgs[];
  change: boolean;
  errors: object | undefined;
}
