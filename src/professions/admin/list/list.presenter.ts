import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { backLink } from '../../../common/utils';
import { IndustriesCheckboxPresenter } from '../../../industries/industries-checkbox.presenter';
import { Industry } from '../../../industries/industry.entity';
import { Nation } from '../../../nations/nation';
import { NationsCheckboxPresenter } from '../../../nations/nations-checkbox.presenter';
import { Profession } from '../../profession.entity';
import { FilterInput } from '../../interfaces/filter-input.interface';
import { IndexTemplate } from './interfaces/index-template.interface';
import { ListEntryPresenter } from './list-entry.presenter';
import { ProfessionsSorter } from '../../../professions/helpers/professions-sorter';
import { Organisation } from '../../../organisations/organisation.entity';
import { OrganisationsCheckboxPresenter } from '../../../organisations/organisations-checkbox-presenter';

export type ListPresenterView = 'overview' | 'single-organisation';

export class ListPresenter {
  constructor(
    private readonly filterInput: FilterInput,
    private readonly userOrganisaiton: Organisation | null,
    private readonly allNations: Nation[],
    private readonly allOrganisations: Organisation[],
    private readonly allIndustries: Industry[],
    private readonly filteredProfessions: Profession[],
    private readonly request: Request,
    private readonly i18nService: I18nService,
  ) {}

  async present(view: ListPresenterView): Promise<IndexTemplate> {
    const organisation =
      view === 'overview'
        ? await this.i18nService.translate('app.ukcpq')
        : this.userOrganisaiton.name;

    const headings = await ListEntryPresenter.headings(this.i18nService, view);

    const nationsCheckboxArgs = await new NationsCheckboxPresenter(
      this.allNations,
      this.filterInput.nations || [],
      this.i18nService,
    ).checkboxArgs();

    const organisationsCheckboxArgs = await new OrganisationsCheckboxPresenter(
      this.allOrganisations,
      this.filterInput.organisations || [],
    ).checkboxArgs();

    const industriesCheckboxArgs = await new IndustriesCheckboxPresenter(
      this.allIndustries,
      this.filterInput.industries || [],
      this.i18nService,
    ).checkboxArgs();

    const sortedProfessions = new ProfessionsSorter(
      this.filteredProfessions,
    ).sortByName();

    const displayProfessions = await Promise.all(
      sortedProfessions.map(async (profession) =>
        new ListEntryPresenter(profession, this.i18nService).tableRow(view),
      ),
    );

    return {
      view,
      organisation,
      headings,
      professions: displayProfessions,
      nationsCheckboxArgs,
      organisationsCheckboxArgs,
      industriesCheckboxArgs,
      changedByCheckboxArgs: [],
      filters: {
        keywords: this.filterInput.keywords || '',
        nations: (this.filterInput.nations || []).map((nation) => nation.name),
        organisations: (this.filterInput.organisations || []).map(
          (organisation) => organisation.name,
        ),
        industries: (this.filterInput.industries || []).map(
          (industry) => industry.name,
        ),
        changedBy: [],
      },
      backLink: backLink(this.request),
    };
  }
}
