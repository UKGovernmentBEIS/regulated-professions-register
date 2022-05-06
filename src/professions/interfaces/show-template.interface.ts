import { SummaryList } from '../../common/interfaces/summary-list';
import { GroupedTierOneOrganisations } from '../helpers/get-grouped-tier-one-organisations-from-profession.helper';
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
  organisations: GroupedTierOneOrganisations;
  enforcementBodies: string;
  decisionYears?: SummaryList;
}
