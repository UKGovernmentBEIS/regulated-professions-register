import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';

export interface QualificationsTemplate {
  routesToObtain: string;
  moreInformationUrl: string;
  ukRecognition: string;
  ukRecognitionUrl: string;
  otherCountriesRecognitionRoutesRadioButtonArgs: RadioButtonArgs[];
  otherCountriesRecognitionSummary: string;
  otherCountriesRecognitionUrl: string;
  captionText: string;
  isUK: boolean;
  errors: object | undefined;
}
