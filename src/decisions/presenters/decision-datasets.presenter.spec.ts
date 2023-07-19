import { Nation } from '../../nations/nation';
import { NationsListPresenter } from '../../nations/presenters/nations-list.presenter';
import { ShowTemplate } from '../interfaces/show-template.interface';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import decisionDatasetFactory from '../../testutils/factories/decision-dataset';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { DecisionDatasetsPresenter } from './decision-datasets.presenter';

jest.mock('../../nations/presenters/nations-list.presenter');

describe('DecisionDatasetsPresenter', () => {
  describe('present', () => {
    it('returns a ShowTemplate for the given Profession, year, and DecisionDatasets', () => {
      const profession = professionFactory.build({
        name: 'Example Profession',
        occupationLocations: ['GB-ENG', 'GB-SCT'],
      });

      const organisation1 = organisationFactory.build({
        name: 'Example Organisation 1',
      });

      const organisation2 = organisationFactory.build({
        name: 'Example Organisation 2',
      });

      const year = 2025;

      const dataset1 = decisionDatasetFactory.build({
        profession,
        organisation: organisation1,
        routes: [
          {
            name: 'Example route 1',
            countries: [
              {
                code: 'DE',
                decisions: {
                  yes: 7,
                  no: 4,
                  yesAfterComp: null,
                  noAfterComp: 11,
                  noOtherConditions: 1,
                },
              },
              {
                code: 'PL',
                decisions: {
                  yes: 3,
                  no: 5,
                  yesAfterComp: 9,
                  noAfterComp: 8,
                  noOtherConditions: 1,
                },
              },
            ],
          },
          {
            name: 'Example route 2',
            countries: [
              {
                code: 'FR',
                decisions: {
                  yes: 2,
                  no: null,
                  yesAfterComp: 12,
                  noAfterComp: 5,
                  noOtherConditions: 1,
                },
              },
              {
                code: 'BE',
                decisions: {
                  yes: 2,
                  no: 3,
                  yesAfterComp: 8,
                  noAfterComp: 1,
                  noOtherConditions: 1,
                },
              },
            ],
          },
        ],
      });

      const dataset2 = decisionDatasetFactory.build({
        profession,
        organisation: organisation2,
        routes: [
          {
            name: 'Example route 3',
            countries: [
              {
                code: 'MA',
                decisions: {
                  yes: 1,
                  no: 3,
                  yesAfterComp: 3,
                  noAfterComp: 4,
                  noOtherConditions: 1,
                },
              },
              {
                code: 'JP',
                decisions: {
                  yes: 1,
                  no: 4,
                  yesAfterComp: 5,
                  noAfterComp: 8,
                  noOtherConditions: 1,
                },
              },
            ],
          },
        ],
      });

      const i18nService = createMockI18nService();

      (NationsListPresenter.prototype.textList as jest.Mock).mockReturnValue(
        'Nation 1, Nation 2',
      );

      const presenter = new DecisionDatasetsPresenter(
        profession,
        year,
        [dataset1, dataset2],
        i18nService,
      );
      const result = presenter.present();

      expect(result).toEqual({
        profession: 'Example Profession',
        nations: 'Nation 1, Nation 2',
        year,
        organisations: [
          {
            organisation: 'Example Organisation 1',
            routes: [
              {
                route: 'Example route 1',
                yes: 10,
                no: 9,
                yesAfterComp: 9,
                noAfterComp: 19,
                noOtherConditions: 2,
                total: 49,
              },
              {
                route: 'Example route 2',
                yes: 4,
                no: 3,
                yesAfterComp: 20,
                noAfterComp: 6,
                noOtherConditions: 2,
                total: 35,
              },
            ],
          },
          {
            organisation: 'Example Organisation 2',
            routes: [
              {
                route: 'Example route 3',
                yes: 2,
                no: 7,
                yesAfterComp: 8,
                noAfterComp: 12,
                noOtherConditions: 2,
                total: 31,
              },
            ],
          },
        ],
      } as ShowTemplate);

      expect(NationsListPresenter).toHaveBeenCalledWith(
        [Nation.find('GB-ENG'), Nation.find('GB-SCT')],
        i18nService,
      );
      expect(NationsListPresenter.prototype.textList).toHaveBeenCalled();
    });
  });
});
