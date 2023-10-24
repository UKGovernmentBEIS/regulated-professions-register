import { I18nService } from 'nestjs-i18n';
import { Nation } from '../../nations/nation';
import { NationsListPresenter } from '../../nations/presenters/nations-list.presenter';
import { ShowTemplate } from '../interfaces/show-template.interface';
import { Profession } from '../../professions/profession.entity';
import { DecisionDataset } from '../decision-dataset.entity';
import { DecisionRoute } from '../interfaces/decision-route.interface';

export class DecisionDatasetsPresenter {
  constructor(
    private readonly profession: Profession,
    private readonly year: number,
    private readonly datasets: DecisionDataset[],
    private readonly i18nService: I18nService,
  ) {}

  present(): ShowTemplate {
    const nations = new NationsListPresenter(
      (this.profession.occupationLocations || []).map((code) =>
        Nation.find(code),
      ),
      this.i18nService,
    );

    return {
      profession: this.profession.name,
      nations: nations.textList(),
      year: this.year,
      organisations: this.datasets.map((dataset) => ({
        organisation: dataset.organisation.name,
        routes: dataset.routes.map((route) => {
          const yes = this.computeTotal(route, 'yes');
          const no = this.computeTotal(route, 'no');
          const yesAfterComp = this.computeTotal(route, 'yesAfterComp');
          const noAfterComp = this.computeTotal(route, 'noAfterComp');
          const noOtherConditions = this.computeTotal(
            route,
            'noOtherConditions',
          );
          const total =
            yes + no + yesAfterComp + noAfterComp + noOtherConditions;

          return {
            route: route.name,
            yes,
            no,
            yesAfterComp,
            noAfterComp,
            noOtherConditions,
            total,
          };
        }),
      })),
    };
  }

  private computeTotal(
    route: DecisionRoute,
    key: keyof DecisionRoute['countries'][0]['decisions'],
  ): number {
    return route.countries.reduce((total, country) => {
      const value = country.decisions[key];
      return total + (typeof value === 'number' ? value : 0);
    }, 0);
  }
}
