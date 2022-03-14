import { Legislation } from '../../../legislations/legislation.entity';
import QualificationPresenter from '../../../qualifications/presenters/qualification.presenter';
import { RegulationType } from '../../profession-version.entity';

export interface CheckYourAnswersTemplate {
  name: string;
  nations: string[];
  industries: string[];
  professionId: string;
  versionId: string;
  organisation: string;
  additionalOrganisation: string;
  registrationRequirements: string;
  registrationUrl: string;
  regulationSummary: string;
  regulationType: RegulationType;
  reservedActivities: string;
  protectedTitles: string;
  regulationUrl: string;
  qualification: QualificationPresenter;
  legislations: Legislation[];
  captionText: string;
  isUK: boolean;
  confirmed: boolean;
  edit: boolean;
}
