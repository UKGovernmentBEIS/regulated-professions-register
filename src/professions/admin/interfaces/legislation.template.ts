import { Legislation } from '../../../legislations/legislation.entity';

export interface LegislationTemplate {
  legislation: Legislation | null;
  captionText: string;
  change: boolean;
  errors?: object;
}
