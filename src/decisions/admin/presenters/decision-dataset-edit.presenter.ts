import { I18nService } from 'nestjs-i18n';
import { CountriesSelectPresenter } from '../../../countries/presenters/countries-select.presenter';
import { DecisionRoute } from '../../interfaces/decision-route.interface';
import { decisionValueToString } from '../helpers/decision-value-to-string.helper';
import { RouteTemplate } from '../interfaces/route-template.interface';

export class DecisionDatasetEditPresenter {
  constructor(
    private readonly routes: DecisionRoute[],
    private readonly i18nService: I18nService,
  ) {}

  present(): RouteTemplate[] {
    return this.routes.map((route) => ({
      name: route.name,
      countries: route.countries.map((country) => ({
        countriesSelectArgs: new CountriesSelectPresenter(
          country.country,
          this.i18nService,
        ).selectArgs(),
        decisions: {
          yes: decisionValueToString(country.decisions.yes),
          no: decisionValueToString(country.decisions.no),
          yesAfterComp: decisionValueToString(country.decisions.yesAfterComp),
          noAfterComp: decisionValueToString(country.decisions.noAfterComp),
        },
      })),
    }));
  }
}
