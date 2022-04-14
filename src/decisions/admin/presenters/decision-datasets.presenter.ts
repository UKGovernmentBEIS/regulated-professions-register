import { I18nService } from 'nestjs-i18n';
import { IndexTemplate } from './../interfaces/index-template.interface';
import { ListEntryPresenter } from './list-entry.presenter';
import { Organisation } from '../../../organisations/organisation.entity';
import { Table } from '../../../common/interfaces/table';
import { DecisionDataset } from '../../decision-dataset.entity';

export class DecisionDatasetsPresenter {
  constructor(
    private readonly userOrganisation: Organisation | null,
    private readonly decisionDatasets: DecisionDataset[],
    private readonly i18nService: I18nService,
  ) {}

  present(): IndexTemplate {
    const organisation = !this.userOrganisation
      ? this.i18nService.translate('app.beis')
      : this.userOrganisation.name;

    return {
      organisation,
      decisionDatasetsTable: this.table(),
    };
  }

  private table(): Table {
    const headings = ListEntryPresenter.headings(this.i18nService);

    const rows = this.decisionDatasets.map((dataset) =>
      new ListEntryPresenter(dataset, this.i18nService).tableRow(),
    );

    const numberOfResults = rows.length;

    const caption =
      numberOfResults === 1
        ? this.i18nService.translate<string>(
            'decisions.admin.dashboard.search.foundSingular',
            {
              args: { count: numberOfResults },
            },
          )
        : this.i18nService.translate<string>(
            'decisions.admin.dashboard.search.foundPlural',
            {
              args: { count: numberOfResults },
            },
          );

    return {
      caption,
      captionClasses: 'govuk-table__caption--m',
      firstCellIsHeader: true,
      head: headings,
      rows: rows,
    };
  }
}
