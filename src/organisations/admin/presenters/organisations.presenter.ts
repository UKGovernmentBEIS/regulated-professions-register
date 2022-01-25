import { I18nService } from 'nestjs-i18n';
import { Organisation } from '../../organisation.entity';
import { OrganisationPresenter } from '../../presenters/organisation.presenter';
import { TableRow } from '../../../common/interfaces/table-row';
import { Table } from '../../../common/interfaces/table';
import { Industry } from '../../../industries/industry.entity';
import { FilterInput } from '../../../common/interfaces/filter-input.interface';
import { IndexTemplate } from '../interfaces/index-template.interface';
import { IndustriesCheckboxPresenter } from '../../../industries/industries-checkbox.presenter';

type Field = 'name' | 'alternateName' | 'industries' | 'actions';
const fields = ['name', 'alternateName', 'industries', 'actions'] as Field[];

export class OrganisationsPresenter {
  constructor(
    private readonly allIndustries: Industry[],
    private readonly filterInput: FilterInput,
    private readonly filteredOrganisations: Organisation[],
    private readonly i18nService: I18nService,
  ) {}

  async present(): Promise<IndexTemplate> {
    const industriesCheckboxArgs = await new IndustriesCheckboxPresenter(
      this.allIndustries,
      this.filterInput.industries || [],
      this.i18nService,
    ).checkboxArgs();

    return {
      industriesCheckboxArgs,
      organisationsTable: await this.table(),
      filters: {
        keywords: this.filterInput.keywords || '',
        industries: (this.filterInput.industries || []).map(
          (industry) => industry.name,
        ),
      },
    };
  }

  private async table(firstCellIsHeader = true): Promise<Table> {
    return {
      firstCellIsHeader: firstCellIsHeader,
      head: await this.headers(),
      rows: await Promise.all(
        this.filteredOrganisations.map(
          async (organisation) =>
            await new OrganisationPresenter(
              organisation,
              this.i18nService,
            ).tableRow(),
        ),
      ),
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
