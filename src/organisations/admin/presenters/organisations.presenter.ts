import { I18nService } from 'nestjs-i18n';
import { Organisation } from '../../organisation.entity';
import { OrganisationPresenter } from '../../presenters/organisation.presenter';
import { TableRow } from '../../../common/interfaces/table-row';
import { Table } from '../../../common/interfaces/table';

type Field = 'name' | 'alternateName' | 'industries' | 'actions';
const fields = ['name', 'alternateName', 'industries', 'actions'] as Field[];

export class OrganisationsPresenter {
  constructor(
    private readonly organisations: Organisation[],
    private readonly i18nService: I18nService,
  ) {}

  async table(firstCellIsHeader = true): Promise<Table> {
    return {
      firstCellIsHeader: firstCellIsHeader,
      head: await this.headers(),
      rows: await Promise.all(
        this.organisations.map(
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
