import { I18nService } from 'nestjs-i18n';
import { Organisation } from '../../organisation.entity';
import { TableRow } from '../../../common/interfaces/table-row';
import { Table } from '../../../common/interfaces/table';
import { Industry } from '../../../industries/industry.entity';
import { FilterInput } from '../../../common/interfaces/filter-input.interface';
import { IndexTemplate } from '../interfaces/index-template.interface';
import { IndustriesCheckboxPresenter } from '../../../industries/industries-checkbox.presenter';
import { Nation } from '../../../nations/nation';
import { NationsCheckboxPresenter } from '../../../nations/nations-checkbox.presenter';
import { RegulationTypesCheckboxPresenter } from '../../../professions/admin/presenters/regulation-types-checkbox.presenter';
import { OrganisationTableRowPresenter } from './organisation-table-row.presenter';

type Field =
  | 'name'
  | 'nations'
  | 'industries'
  | 'lastModified'
  | 'changedBy'
  | 'status'
  | 'actions';
const fields = [
  'name',
  'nations',
  'industries',
  'lastModified',
  'changedBy',
  'status',
  'actions',
] as Field[];

export type OrganisationsPresenterView = 'overview' | 'single-organisation';

export class OrganisationsPresenter {
  constructor(
    private readonly userOrganisation: string,
    private readonly allNations: Nation[],
    private readonly allIndustries: Industry[],
    private readonly filterInput: FilterInput,
    private readonly filteredOrganisations: Organisation[],
    private readonly i18nService: I18nService,
  ) {}

  present(view: OrganisationsPresenterView): IndexTemplate {
    const nationsCheckboxItems = new NationsCheckboxPresenter(
      this.allNations,
      this.filterInput.nations || [],
      this.i18nService,
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
      userOrganisation: this.userOrganisation,
      nationsCheckboxItems,
      industriesCheckboxItems,
      regulationTypesCheckboxItems,
      organisationsTable: this.table(),
      filters: {
        keywords: this.filterInput.keywords || '',
        nations: (this.filterInput.nations || []).map((nation) => nation.name),
        industries: (this.filterInput.industries || []).map(
          (industry) => industry.name,
        ),
        regulationTypes: this.filterInput.regulationTypes || [],
      },
    };
  }

  private table(firstCellIsHeader = true): Table {
    const rows = this.filteredOrganisations.map((organisation) =>
      new OrganisationTableRowPresenter(
        organisation,
        this.i18nService,
      ).tableRow(),
    );

    const numberOfResults = rows.length;

    const caption =
      numberOfResults === 1
        ? (this.i18nService.translate<string>(
            'organisations.search.foundSingular',
            { args: { count: numberOfResults } },
          ) as string)
        : (this.i18nService.translate<string>(
            'organisations.search.foundPlural',
            {
              args: { count: numberOfResults },
            },
          ) as string);

    return {
      caption,
      captionClasses: 'govuk-table__caption--m',
      firstCellIsHeader: firstCellIsHeader,
      head: this.headers(),
      rows: rows,
    };
  }

  private headers(): TableRow {
    return fields
      .map(
        (field) =>
          this.i18nService.translate(
            `organisations.admin.tableHeading.${field}`,
          ) as string,
      )
      .map((text) => ({ text }));
  }
}
