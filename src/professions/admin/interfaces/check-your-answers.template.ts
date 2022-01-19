import { Legislation } from '../../../legislations/legislation.entity';
import QualificationPresenter from '../../../qualifications/presenters/qualification.presenter';

export interface CheckYourAnswersTemplate {
  name: string;
  nations: string[];
  industries: string[];
  professionId: string;
  organisation: string;
  mandatoryRegistration: string;
  reservedActivities: string;
  description: string;
  qualification: QualificationPresenter;
  legislation: Legislation;
  captionText: string;
  confirmed: boolean;
  edit: boolean;
  backLink: string;
}
