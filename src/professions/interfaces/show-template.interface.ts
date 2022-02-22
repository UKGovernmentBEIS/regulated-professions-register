import { SummaryList } from '../../common/interfaces/summary-list';
import { Organisation } from '../../organisations/organisation.entity';
import { ProfessionPresenter } from '../presenters/profession.presenter';
import { Profession } from '../profession.entity';

export interface ShowTemplate {
  profession: Profession;
  presenter?: ProfessionPresenter;
  qualificationSummaryList: SummaryList;
  nations: string[];
  industries: string[];
  organisation: Organisation;
}
