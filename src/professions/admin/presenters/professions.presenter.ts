import { I18nService } from 'nestjs-i18n';
import { IndustriesCheckboxPresenter } from '../../../industries/industries-checkbox.presenter';
import { Industry } from '../../../industries/industry.entity';
import { Nation } from '../../../nations/nation';
import { NationsCheckboxPresenter } from '../../../nations/nations-checkbox.presenter';
import { Profession } from '../../profession.entity';
import { FilterInput } from '../../../common/interfaces/filter-input.interface';
import { IndexTemplate } from './../interfaces/index-template.interface';
import { ListEntryPresenter } from './../presenters/list-entry.presenter';
import { Organisation } from '../../../organisations/organisation.entity';
import { OrganisationsCheckboxPresenter } from '../../../organisations/organisations-checkbox-presenter';
import { Table } from '../../../common/interfaces/table';
import { RegulationTypesCheckboxPresenter } from './regulation-types-checkbox.presenter';
import { User } from '../../../users/user.entity';
import { getUserOrganisation } from '../../../users/helpers/get-user-organisation';

export type ProfessionsPresenterView = 'overview' | 'single-organisation';

export class ProfessionsPresenter {
  constructor(
    private readonly filterInput: FilterInput,
    private readonly user: User,
    private readonly allNations: Nation[],
    private readonly allOrganisations: Organisation[],
    private readonly allIndustries: Industry[],
    private readonly filteredProfessions: Profession[],
    private readonly i18nService: I18nService,
  ) {}

  present(
    view: ProfessionsPresenterView,
  ): Omit<IndexTemplate, 'filterQuery' | 'sortMethod'> {
    const organisation = getUserOrganisation(this.user, this.i18nService);

    const nationsCheckboxItems = new NationsCheckboxPresenter(
      this.allNations,
      this.filterInput.nations || [],
      this.i18nService,
    ).checkboxItems();

    const organisationsCheckboxItems = new OrganisationsCheckboxPresenter(
      this.allOrganisations,
      this.filterInput.organisations || [],
    ).checkboxItems();

    const industriesCheckboxItems = new IndustriesCheckboxPresenter(
      this.allIndustries,
      this.filterInput.industries || [],
      this.i18nService,
    ).checkboxItems();

    const regulationTypesCheckboxItems = new RegulationTypesCheckboxPresenter(
      this.filterInput.regulationTypes || [],
      this.i18nService,
    ).checkboxItems();

    return {
      view,
      organisation,
      professionsTable: this.table(view),
      nationsCheckboxItems,
      organisationsCheckboxItems,
      industriesCheckboxItems,
      regulationTypesCheckboxItems,
      filters: {
        keywords: this.filterInput.keywords || '',
        nations: (this.filterInput.nations || []).map((nation) => nation.name),
        organisations: (this.filterInput.organisations || []).map(
          (organisation) => organisation.name,
        ),
        industries: (this.filterInput.industries || []).map(
          (industry) => industry.name,
        ),
        regulationTypes: this.filterInput.regulationTypes || [],
      },
    };
  }

  private table(view: ProfessionsPresenterView): Table {
    const headings = ListEntryPresenter.headings(this.i18nService, view);

    const rows = this.filteredProfessions.map((profession) =>
      new ListEntryPresenter(profession, this.i18nService).tableRow(view),
    );

    const numberOfResults = rows.length;

    const caption =
      numberOfResults === 1
        ? (this.i18nService.translate<string>(
            'professions.search.foundSingular',
            {
              args: { count: numberOfResults },
            },
          ) as string)
        : (this.i18nService.translate<string>(
            'professions.search.foundPlural',
            {
              args: { count: numberOfResults },
            },
          ) as string);

    return {
      caption,
      captionClasses: 'govuk-table__caption--m',
      firstCellIsHeader: true,
      head: headings,
      rows: rows,
    };
  }
}
