import { Legislation } from '../../../legislations/legislation.entity';

export interface LegislationTemplate {
  legislation: Legislation | null;
  captionText: string;
  backLink: string;
  errors: object | undefined;
}
