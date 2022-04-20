import { I18nService } from 'nestjs-i18n';
import { Table } from '../../common/interfaces/table';
import { TableRow } from '../../common/interfaces/table-row';
import { Country } from '../../countries/country';
import { decisionValueToString } from '../admin/helpers/decision-value-to-string.helper';
import { DecisionRoute } from '../interfaces/decision-route.interface';

export class DecisionDatasetPresenter {
  constructor(
    private readonly routes: DecisionRoute[],
    private readonly i18nService: I18nService,
  ) {}

  tables(): Table[] {
    const head: TableRow = [
      {
        text: this.i18nService.translate<string>(
          'decisions.show.tableHeading.country',
        ),
      },
      {
        text: this.i18nService.translate<string>(
          'decisions.show.tableHeading.yes',
        ),
      },
      {
        text: this.i18nService.translate<string>(
          'decisions.show.tableHeading.yesAfterComp',
        ),
      },
      {
        text: this.i18nService.translate<string>(
          'decisions.show.tableHeading.no',
        ),
      },
      {
        text: this.i18nService.translate<string>(
          'decisions.show.tableHeading.noAfterComp',
        ),
      },
    ];

    return this.routes.map((route) => {
      const table: Table = {
        classes: 'rpr-decision-data__table-container',
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
          ];
        }),
      };

      return table;
    });
  }
}
