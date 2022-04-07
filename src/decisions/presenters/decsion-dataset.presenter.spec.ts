import { Table } from '../../common/interfaces/table';
import { TableRow } from '../../common/interfaces/table-row';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';
import { DecisionRoute } from '../interfaces/decision-route.interface';
import { DecisionDatasetPresenter } from './decision-dataset.presenter';

describe('DecisionDatasetPresenter', () => {
  describe('tables', () => {
    it('returns a tables of decision data', () => {
      const i18nService = createMockI18nService();

      const routes: DecisionRoute[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              country: 'Example country 1',
              decisions: {
                yes: 4,
                no: 5,
                yesAfterComp: 6,
                noAfterComp: 7,
              },
            },
            {
              country: 'Example country 2',
              decisions: {
                yes: 5,
                no: 8,
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
              country: 'Example country 3',
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
                text: 'Example country 1',
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
                text: 'Example country 2',
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
                text: 'Example country 3',
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
    });
  });
});
