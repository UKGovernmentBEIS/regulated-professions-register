import { DecisionRoute } from '../../interfaces/decision-route.interface';

const emptyCountry = {
  code: null,
  decisions: {
    yes: null,
    no: null,
    yesAfterComp: null,
    noAfterComp: null,
    noOtherConditions: null,
  },
};

export function modifyDecisionRoutes(
  routes: DecisionRoute[],
  action: string,
): void {
  const tokens = action.split(':');
  const command = tokens[0];

  const routeIndex = parseInt(tokens?.[1]) - 1;
  const countryIndex = parseInt(tokens?.[2]) - 1;

  switch (command) {
    case 'addRoute':
      routes.push({
        name: '',
        countries: [emptyCountry],
      });
      return;
    case 'removeRoute':
      routes.splice(routeIndex, 1);
      return;
    case 'addCountry':
      routes[routeIndex].countries.push(emptyCountry);
      return;
    case 'removeCountry':
      routes[routeIndex].countries.splice(countryIndex, 1);
      return;
  }
}
