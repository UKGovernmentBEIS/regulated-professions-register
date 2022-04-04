import { Legislation } from '../../../legislations/legislation.entity';
import QualificationPresenter from '../../../qualifications/presenters/qualification.presenter';
import { PublicationBlocker } from '../../helpers/get-publication-blockers.helper';
import { RegulationType } from '../../profession-version.entity';
import { SummaryList } from '../../../common/interfaces/summary-list';

export interface CheckYourAnswersTemplate {
  name: string;
  nations: string;
  industries: string[];
  professionId: string;
  versionId: string;
  organisations: SummaryList[];
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
  publicationBlockers: PublicationBlocker[];
  edit: boolean;
}
