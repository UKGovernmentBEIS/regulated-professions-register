import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';

export interface QualificationsTemplate {
  level: string;
  routesToObtain: string;
  mostCommonRouteToObtain: string;
  duration: string;
  mandatoryProfessionalExperienceRadioButtonArgs: RadioButtonArgs[];
  moreInformationUrl: string;
  ukRecognition: string;
  ukRecognitionUrl: string;
  otherCountriesRecognition: string;
  otherCountriesRecognitionUrl: string;
  captionText: string;
  isUK: boolean;
  change: boolean;
  errors: object | undefined;
}
