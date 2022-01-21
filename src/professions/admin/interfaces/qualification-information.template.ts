import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';

export interface QualificationInformationTemplate {
  level: string;
  methodToObtainQualificationRadioButtonArgs: RadioButtonArgs[];
  mostCommonPathToObtainQualificationRadioButtonArgs: RadioButtonArgs[];
  duration: string;
  mandatoryProfessionalExperienceRadioButtonArgs: RadioButtonArgs[];
  captionText: string;
  change: boolean;
  errors: object | undefined;
}
