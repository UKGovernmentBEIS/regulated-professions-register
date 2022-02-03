import { Organisation } from '../../organisations/organisation.entity';
import QualificationPresenter from '../../qualifications/presenters/qualification.presenter';
import { Profession } from '../profession.entity';

export interface ShowTemplate {
  profession: Profession;
  qualification: QualificationPresenter;
  nations: string[];
  industries: string[];
  organisation: Organisation;
}
