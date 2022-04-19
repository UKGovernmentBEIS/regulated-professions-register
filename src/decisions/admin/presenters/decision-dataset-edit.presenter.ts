import { DecisionRoute } from '../../interfaces/decision-route.interface';
import { decisionValueToString } from '../helpers/decision-value-to-string.helper';
import { RouteTemplate } from '../interfaces/route-template.interface';
import { CountriesSelectPresenter } from './countries-select.presenter';

export class DecisionDatasetEditPresenter {
  constructor(private readonly routes: DecisionRoute[]) {}

  present(): RouteTemplate[] {
    return this.routes.map((route) => ({
      name: route.name,
      countries: route.countries.map((country) => ({
        countriesSelectArgs: new CountriesSelectPresenter(
          country.country,
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
