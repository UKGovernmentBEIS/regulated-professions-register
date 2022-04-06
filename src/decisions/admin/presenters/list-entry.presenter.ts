import { I18nService } from 'nestjs-i18n';
import { TableCell } from '../../../common/interfaces/table-cell';
import { TableRow } from '../../../common/interfaces/table-row';
import { escape } from '../../../helpers/escape.helper';
import { DecisionDataset } from '../../decision-dataset.entity';
import { formatDate } from '../../../common/utils';
import { formatStatus } from '../../../helpers/format-status.helper';

type Field = 'profession' | 'year' | 'lastModified' | 'status' | 'actions';

const fields: Field[] = [
  'profession',
  'year',
  'lastModified',
  'status',
  'actions',
];

export class ListEntryPresenter {
  static headings(i18nService: I18nService): TableRow {
    return fields
      .map((field) =>
        i18nService.translate<string>(
          `decisions.admin.dashboard.tableHeading.${field}`,
        ),
      )
      .map((text) => ({ text }));
  }

  constructor(
    private readonly dataset: DecisionDataset,
    private readonly i18nService: I18nService,
  ) {}

  async tableRow(): Promise<TableRow> {
    const viewDetails = `<a class="govuk-link" href="/admin/decisions/${
      this.dataset.profession.id
    }/${this.dataset.organisation.id}/${
      this.dataset.year
    }">${this.i18nService.translate<string>(
      'decisions.admin.dashboard.viewDetails',
      {
        args: {
          profession: escape(this.dataset.profession.name),
          organisation: escape(this.dataset.organisation.name),
          year: this.dataset.year.toString(),
        },
      },
    )}</a>`;

    const entries: { [K in Field]: TableCell } = {
      profession: { text: this.dataset.profession.name },
      year: { text: this.dataset.year.toString() },
      lastModified: { text: formatDate(this.dataset.updated_at) },
      status: {
        html: await formatStatus(this.dataset.status, this.i18nService),
      },
      actions: { html: viewDetails },
    };

    return fields.map((field) => entries[field]);
  }
}
