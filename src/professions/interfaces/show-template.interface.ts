import { SummaryList } from '../../common/interfaces/summary-list';
import { GroupedTierOneOrganisations } from '../helpers/get-grouped-tier-one-organisations-from-profession.helper';
import { Profession } from '../profession.entity';

export interface ShowTemplate {
  profession: Profession;
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
