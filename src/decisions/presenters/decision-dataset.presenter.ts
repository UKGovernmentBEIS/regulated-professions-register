import { I18nService } from 'nestjs-i18n';
import { Table } from '../../common/interfaces/table';
import { TableRow } from '../../common/interfaces/table-row';
import { Country } from '../../countries/country';
import { decisionValueToString } from '../admin/helpers/decision-value-to-string.helper';
import { formatDate } from '../../common/utils';
import {
  DecisionDataset,
  DecisionDatasetStatus,
} from '../decision-dataset.entity';

export class DecisionDatasetPresenter {
  constructor(
    private readonly dataset: DecisionDataset,
    private readonly i18nService: I18nService,
  ) {}

  tables(): Table[] {
    const head: TableRow = [
      {
        text: this.i18nService.translate<string>(
          'decisions.show.tableHeading.country',
        ) as string,
      },
      {
        text: this.i18nService.translate<string>(
          'decisions.show.tableHeading.yes',
        ) as string,
      },
      {
        text: this.i18nService.translate<string>(
          'decisions.show.tableHeading.yesAfterComp',
        ) as string,
      },
      {
        text: this.i18nService.translate<string>(
          'decisions.show.tableHeading.no',
        ) as string,
      },
      {
        text: this.i18nService.translate<string>(
          'decisions.show.tableHeading.noAfterComp',
        ) as string,
      },
      {
        text: this.i18nService.translate<string>(
          'decisions.show.tableHeading.noOtherConditions',
        ) as string,
      },
      {
        text: this.i18nService.translate<string>(
          'decisions.show.tableHeading.total',
        ) as string,
      },
    ];

    return this.dataset.routes.map((route) => {
      const table: Table = {
        classes: 'rpr-decision-data__show-table',
        captionClasses: 'govuk-table__caption--l',
        caption: route.name,
        head,
        rows: route.countries.map((country) => {
          return [
            {
              text: country.code
                ? Country.find(country.code).translatedName(this.i18nService)
                : '',
            },
            {
              text: decisionValueToString(country.decisions.yes),
            },
            {
              text: decisionValueToString(country.decisions.yesAfterComp),
            },
            {
              text: decisionValueToString(country.decisions.no),
            },
            {
              text: decisionValueToString(country.decisions.noAfterComp),
            },
            {
              text: decisionValueToString(country.decisions.noOtherConditions),
            },
            {
              text: this.computeTotal(country.decisions).toString(),
            },
          ];
        }),
      };

      return table;
    });
  }
  get changedBy(): { name: string; email: string } {
    const user = this.dataset.user;
    return user
      ? {
          name: user.name,
          email: user.email,
        }
      : null;
  }

  get lastModified(): string {
    return formatDate(this.dataset.updated_at);
  }

  get status(): DecisionDatasetStatus {
    return this.dataset.status;
  }

  private computeTotal(decisions: {
    yes: number;
    no: number;
    yesAfterComp: number;
    noAfterComp: number;
    noOtherConditions: number;
  }): number {
    const yes = typeof decisions.yes === 'number' ? decisions.yes : 0;
    const no = typeof decisions.no === 'number' ? decisions.no : 0;
    const yesAfterComp =
      typeof decisions.yesAfterComp === 'number' ? decisions.yesAfterComp : 0;
    const noAfterComp =
      typeof decisions.noAfterComp === 'number' ? decisions.noAfterComp : 0;
    const noOtherConditions =
      typeof decisions.noOtherConditions === 'number'
        ? decisions.noOtherConditions
        : 0;

    return yes + no + yesAfterComp + noAfterComp + noOtherConditions;
  }
}
