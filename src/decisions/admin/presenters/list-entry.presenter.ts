import { I18nService } from 'nestjs-i18n';
import { TableCell } from '../../../common/interfaces/table-cell';
import { TableRow } from '../../../common/interfaces/table-row';
import { escape } from '../../../helpers/escape.helper';
import { DecisionDataset } from '../../decision-dataset.entity';
import { formatDate } from '../../../common/utils';
import { formatStatus } from '../../../helpers/format-status.helper';
import { DecisionDatasetsPresenterView } from './decision-datasets.presenter';
import { ProfessionsPresenterView } from '../../../professions/admin/presenters/professions.presenter';

type Field =
  | 'profession'
  | 'year'
  | 'lastModified'
  | 'status'
  | 'actions'
  | 'regulator';

const fields = {
  overview: [
    'profession',
    'regulator',
    'year',
    'lastModified',
    'status',
    'actions',
  ],
  'single-organisation': [
    'profession',
    'year',
    'lastModified',
    'status',
    'actions',
  ],
} as { [K in DecisionDatasetsPresenterView]: Field[] };

export class ListEntryPresenter {
  static headings(
    i18nService: I18nService,
    contents: DecisionDatasetsPresenterView,
  ): TableRow {
    return fields[contents]
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

  tableRow(contents: ProfessionsPresenterView): TableRow {
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
      regulator: { text: this.dataset.organisation.name },
      year: { text: this.dataset.year.toString() },
      lastModified: { text: formatDate(this.dataset.updated_at) },
      status: {
        html: formatStatus(this.dataset.status, this.i18nService),
      },
      actions: { html: viewDetails },
    };

    return fields[contents].map((field) => entries[field]);
  }
}
