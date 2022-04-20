import { Country } from '../../../countries/country';
import { DecisionRoute } from '../../interfaces/decision-route.interface';
import { EditDto } from '../dto/edit.dto';
import { parseDecisionValue } from './parse-decision-value.helper';

const maxRouteCount = 1000;
const maxCountryCount = 1000;

export function parseEditDtoDecisionRoutes(editDto: EditDto): DecisionRoute[] {
  const routes: DecisionRoute[] = [];

  const routeCount = editDto.routes?.length || 0;

  for (
    let routeIndex = 0;
    routeIndex < Math.min(routeCount, maxRouteCount);
    routeIndex++
  ) {
    const route: DecisionRoute = {
      name: editDto.routes[routeIndex],
      countries: [],
    };

    routes.push(route);

    const countries = editDto.countries?.[routeIndex] || [];
    const yeses = editDto.yeses?.[routeIndex] || [];
    const noes = editDto.noes?.[routeIndex] || [];
    const yesAfterComps = editDto.yesAfterComps?.[routeIndex] || [];
    const noAfterComps = editDto.noAfterComps?.[routeIndex] || [];

    const countriesCount = countries.length;

    for (
      let countryIndex = 0;
      countryIndex < Math.min(countriesCount, maxCountryCount);
      countryIndex++
    ) {
      type DecisionCountry = DecisionRoute['countries'][0];

      const country: DecisionCountry = {
        code: countries[countryIndex]
          ? Country.find(countries[countryIndex]).code
          : null,
        decisions: {
          yes: parseDecisionValue(yeses[countryIndex]),
          no: parseDecisionValue(noes[countryIndex]),
          yesAfterComp: parseDecisionValue(yesAfterComps[countryIndex]),
          noAfterComp: parseDecisionValue(noAfterComps[countryIndex]),
        },
      };

      route.countries.push(country);
    }
  }

  return routes;
}
