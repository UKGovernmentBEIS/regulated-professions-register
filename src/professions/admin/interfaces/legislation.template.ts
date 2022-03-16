import { Legislation } from '../../../legislations/legislation.entity';

export interface LegislationTemplate {
  legislation: Legislation | null;
  secondLegislation: Legislation | null;
  captionText: string;
  errors?: object;
}
