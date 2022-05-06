import { Stringifier, stringify } from 'csv-stringify';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Country } from '../../../countries/country';
import { DecisionDataset } from '../../decision-dataset.entity';
import { DecisionRoute } from '../../interfaces/decision-route.interface';
import { decisionValueToString } from './decision-value-to-string.helper';

export class DecisionsCsvWriter {
  constructor(
    private readonly response: Response,
    private readonly filename: string,
    private readonly datasets: DecisionDataset[],
    private readonly i18nService: I18nService,
  ) {}

  write(): void {
    const stringifier = stringify();

    this.response.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${this.filename}.csv"`,
    });

    stringifier.pipe(this.response);

    this.writeHeadings(stringifier);

    this.datasets.forEach((dataset) => {
      dataset.routes.forEach((route) => {
        this.writeRoute(dataset, route, stringifier);
      });
    });

    stringifier.end();
  }

  private writeRoute(
    dataset: DecisionDataset,
    route: DecisionRoute,
    stringifier: Stringifier,
  ): void {
    route.countries.forEach((country) => {
      stringifier.write([
        dataset.profession.name,
        dataset.organisation.name,
        dataset.year.toString(),
        this.i18nService.translate<string>(
          `decisions.csv.status.${dataset.status}`,
        ),
        route.name,
        country.code
          ? Country.find(country.code).translatedName(this.i18nService)
          : '',
        country.code || '',
        decisionValueToString(country.decisions.yes),
        decisionValueToString(country.decisions.yesAfterComp),
        decisionValueToString(country.decisions.no),
        decisionValueToString(country.decisions.noAfterComp),
      ]);
    });
  }

  private writeHeadings(stringifier: Stringifier): void {
    stringifier.write(
      [
        'decisions.csv.heading.profession',
        'decisions.csv.heading.organisation',
        'decisions.csv.heading.year',
        'decisions.csv.heading.status',
        'decisions.csv.heading.route',
        'decisions.csv.heading.countryName',
        'decisions.csv.heading.countryCode',
        'decisions.csv.heading.yes',
        'decisions.csv.heading.yesAfterComp',
        'decisions.csv.heading.no',
        'decisions.csv.heading.noAfterComp',
      ].map((id) => this.i18nService.translate<string>(id)),
    );
  }
}
