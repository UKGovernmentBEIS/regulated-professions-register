import { SummaryList } from '../../common/interfaces/summary-list';
import { OrganisationWithRole } from '../../common/interfaces/organisation-with-role.interface';
import { ProfessionPresenter } from '../presenters/profession.presenter';
import { Profession } from '../profession.entity';

export interface ShowTemplate {
  profession: Profession;
  presenter?: ProfessionPresenter;
  qualifications: {
    overviewSummaryList: SummaryList;
    ukSummaryList: SummaryList;
    otherCountriesSummaryList: SummaryList;
  };
  nations: string;
  industries: string[];
  organisations: OrganisationWithRole[];
}
