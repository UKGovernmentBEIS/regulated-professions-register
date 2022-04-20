import { Table } from '../../common/interfaces/table';
import { TableRow } from '../../common/interfaces/table-row';
import { Country } from '../../countries/country';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';
import * as decisionValueToStringModule from '../admin/helpers/decision-value-to-string.helper';
import { DecisionRoute } from '../interfaces/decision-route.interface';
import { DecisionDatasetPresenter } from './decision-dataset.presenter';

jest.mock('../../countries/country');

describe('DecisionDatasetPresenter', () => {
  describe('tables', () => {
    it('returns a tables of decision data', () => {
      (Country.find as jest.Mock).mockImplementation((code: string) => ({
        code,
        translatedName: () =>
          translationOf(`countries.${code.toLocaleLowerCase()}`),
      }));

      const i18nService = createMockI18nService();

      const spotCheckCountryCode = 'CY';
      const spotCheckValue = 8;

      const routes: DecisionRoute[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              code: spotCheckCountryCode,
              decisions: {
                yes: 4,
                no: 5,
                yesAfterComp: 6,
                noAfterComp: 7,
              },
            },
            {
              code: 'FR',
              decisions: {
                yes: 5,
                no: spotCheckValue,
                yesAfterComp: 0,
                noAfterComp: 4,
              },
            },
          ],
        },
        {
          name: 'Example route 2',
          countries: [
            {
              code: 'JP',
              decisions: {
                yes: 1,
                no: 3,
                yesAfterComp: 11,
                noAfterComp: 2,
              },
            },
          ],
        },
      ];

      const decisionValueToStringSpy = jest.spyOn(
        decisionValueToStringModule,
        'decisionValueToString',
      );

      const presenter = new DecisionDatasetPresenter(routes, i18nService);

      const expectedHead: TableRow = [
        {
          text: translationOf('decisions.show.tableHeading.country'),
        },
        {
          text: translationOf('decisions.show.tableHeading.yes'),
        },
        {
          text: translationOf('decisions.show.tableHeading.yesAfterComp'),
        },
        {
          text: translationOf('decisions.show.tableHeading.no'),
        },
        {
          text: translationOf('decisions.show.tableHeading.noAfterComp'),
        },
      ];

      const expected: Table[] = [
        {
          caption: 'Example route 1',
          classes: 'rpr-decision-data__table-container',
          captionClasses: 'govuk-table__caption--l',
          head: expectedHead,
          rows: [
            [
              {
                text: translationOf('countries.cy'),
              },
              {
                text: '4',
              },
              {
                text: '6',
              },
              {
                text: '5',
              },
              {
                text: '7',
              },
            ],
            [
              {
                text: translationOf('countries.fr'),
              },
              {
                text: '5',
              },
              {
                text: '0',
              },
              {
                text: '8',
              },
              {
                text: '4',
              },
            ],
          ],
        },
        {
          caption: 'Example route 2',
          classes: 'rpr-decision-data__table-container',
          captionClasses: 'govuk-table__caption--l',
          head: expectedHead,
          rows: [
            [
              {
                text: translationOf('countries.jp'),
              },
              {
                text: '1',
              },
              {
                text: '11',
              },
              {
                text: '3',
              },
              {
                text: '2',
              },
            ],
          ],
        },
      ];

      const result = presenter.tables();

      expect(expected).toEqual(result);

      expect(Country.find).toHaveBeenCalledTimes(3);
      expect(Country.find).toHaveBeenNthCalledWith(1, spotCheckCountryCode);

      expect(decisionValueToStringSpy).toHaveBeenCalledTimes(12);
      expect(decisionValueToStringSpy).nthCalledWith(7, spotCheckValue);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});
