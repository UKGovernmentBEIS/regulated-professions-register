import { Organisation } from '../organisation.entity';
import { SummaryList } from '../../common/interfaces/summary-list';
import { OrganisationPresenter } from '../presenters/organisation.presenter';

export interface ShowTemplate {
  organisation: Organisation;
  presenter?: OrganisationPresenter;
  summaryList: SummaryList;
  professions: {
    name: string;
    slug: string;
    id: string;
    versionId: string;
    summaryList: SummaryList;
  }[];
}
