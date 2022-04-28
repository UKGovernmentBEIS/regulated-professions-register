import { I18nService } from 'nestjs-i18n';
import { IndexTemplate } from './../interfaces/index-template.interface';
import { ListEntryPresenter } from './list-entry.presenter';
import { Organisation } from '../../../organisations/organisation.entity';
import { Table } from '../../../common/interfaces/table';
import { DecisionDataset } from '../../decision-dataset.entity';
import { FilterInput } from '../../../common/interfaces/filter-input.interface';
import { OrganisationsCheckboxPresenter } from '../../../organisations/organisations-checkbox-presenter';
import { YearsCheckboxPresenter } from './years-checkbox.presenter';
import { DecisionDatasetStatusesCheckboxPresenter } from './decision-dataset-statuses-checkbox.presenter';

export type DecisionDatasetsPresenterView = 'overview' | 'single-organisation';

export class DecisionDatasetsPresenter {
  constructor(
    private readonly filterInput: FilterInput,
    private readonly userOrganisation: Organisation | null,
    private readonly allOrganisations: Organisation[],
    private readonly startYear: number,
    private readonly endYear: number,
    private readonly decisionDatasets: DecisionDataset[],
    private readonly i18nService: I18nService,
  ) {}

  present(
    view: DecisionDatasetsPresenterView,
  ): Omit<IndexTemplate, 'filterQuery'> {
    const organisation =
      view === 'overview'
        ? this.i18nService.translate('app.beis')
        : this.userOrganisation.name;

    const organisationsCheckboxItems = new OrganisationsCheckboxPresenter(
      this.allOrganisations,
      this.filterInput.organisations || [],
    ).checkboxItems();

    const yearsCheckboxItems = new YearsCheckboxPresenter(
      this.startYear,
      this.endYear,
      this.filterInput.years,
    ).checkboxItems();

    const statusesCheckboxItems = new DecisionDatasetStatusesCheckboxPresenter(
      this.filterInput.statuses,
      this.i18nService,
    ).checkboxItems();

    return {
      view,
      organisation,
      decisionDatasetsTable: this.table(view),
      filters: {
        keywords: this.filterInput.keywords || '',
        organisations: (this.filterInput.organisations || []).map(
          (organisation) => organisation.name,
        ),
        years: this.filterInput.years || [],
        statuses: this.filterInput.statuses || [],
      },
      organisationsCheckboxItems,
      yearsCheckboxItems,
      statusesCheckboxItems,
    };
  }

  private table(view: DecisionDatasetsPresenterView): Table {
    const headings = ListEntryPresenter.headings(this.i18nService, view);

    const rows = this.decisionDatasets.map((dataset) =>
      new ListEntryPresenter(dataset, this.i18nService).tableRow(view),
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
