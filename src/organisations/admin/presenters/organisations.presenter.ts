import { I18nService } from 'nestjs-i18n';
import { Organisation } from '../../organisation.entity';
import { OrganisationPresenter } from '../../presenters/organisation.presenter';
import { TableRow } from '../../../common/interfaces/table-row';
import { Table } from '../../../common/interfaces/table';
import { Industry } from '../../../industries/industry.entity';
import { FilterInput } from '../../../common/interfaces/filter-input.interface';
import { IndexTemplate } from '../interfaces/index-template.interface';
import { IndustriesCheckboxPresenter } from '../../../industries/industries-checkbox.presenter';
import { Nation } from '../../../nations/nation';
import { NationsCheckboxPresenter } from '../../../nations/nations-checkbox.presenter';
import { RegulationTypesCheckboxPresenter } from '../../../professions/admin/presenters/regulation-types-checkbox.presenter';

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

  async present(view: OrganisationsPresenterView): Promise<IndexTemplate> {
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
      organisationsTable: await this.table(),
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

  private async table(firstCellIsHeader = true): Promise<Table> {
    const rows = await Promise.all(
      this.filteredOrganisations.map(
        async (organisation) =>
          await new OrganisationPresenter(
            organisation,
            this.i18nService,
          ).tableRow(),
      ),
    );

    const numberOfResults = rows.length;

    const caption =
      numberOfResults === 1
        ? await this.i18nService.translate(
            'organisations.search.foundSingular',
            { args: { count: numberOfResults } },
          )
        : await this.i18nService.translate('organisations.search.foundPlural', {
            args: { count: numberOfResults },
          });

    return {
      caption,
      captionClasses: 'govuk-table__caption--m',
      firstCellIsHeader: firstCellIsHeader,
      head: await this.headers(),
      rows: rows,
    };
  }

  private async headers(): Promise<TableRow> {
    return (
      await Promise.all(
        fields.map(
          (field) =>
            this.i18nService.translate(
              `organisations.admin.tableHeading.${field}`,
            ) as Promise<string>,
        ),
      )
    ).map((text) => ({ text }));
  }
}
