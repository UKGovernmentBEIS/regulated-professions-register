import { Legislation } from '../../../../legislations/legislation.entity';

export interface LegislationTemplate {
  legislation: Legislation | null;
  backLink: string;
  errors: object | undefined;
}
