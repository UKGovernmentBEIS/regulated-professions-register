import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';

export interface QualificationInformationTemplate {
  level: string;
  methodToObtainQualificationRadioButtonArgs: RadioButtonArgs[];
  mostCommonPathToObtainQualificationRadioButtonArgs: RadioButtonArgs[];
  duration: string;
  mandatoryProfessionalExperienceRadioButtonArgs: RadioButtonArgs[];
  ukRecognition: string;
  ukRecognitionUrl: string;
  otherCountriesRecognition: string;
  otherCountriesRecognitionUrl: string;
  captionText: string;
  change: boolean;
  errors: object | undefined;
}
