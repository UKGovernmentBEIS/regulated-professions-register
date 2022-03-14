import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';

export interface RegulatedActivitiesTemplate {
  regulationSummary: string;
  regulationTypeRadioButtonArgs: RadioButtonArgs[];
  reservedActivities: string;
  protectedTitles: string;
  regulationUrl: string;
  captionText: string;
  change: boolean;
  errors: object | undefined;
}
