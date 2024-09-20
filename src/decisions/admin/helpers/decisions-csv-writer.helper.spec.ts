import { createMock } from '@golevelup/ts-jest';
import * as stringifyModule from 'csv-stringify';
import { Response } from 'express';
import { Country } from '../../../countries/country';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import decisionDatasetFactory from '../../../testutils/factories/decision-dataset';
import organisation from '../../../testutils/factories/organisation';
import professionFactory from '../../../testutils/factories/profession';
import { translationOf } from '../../../testutils/translation-of';
import { DecisionDatasetStatus } from '../../decision-dataset.entity';
import { DecisionsCsvWriter } from './decisions-csv-writer.helper';

jest.mock('../../../countries/country');
jest.mock('csv-stringify', () => ({ __esModule: true, ...jest.requireActual('csv-stringify') }));

describe('DecisionsCsvWriter', () => {
  describe('write', () => {
    it('writes a CSV file of the given datasets', () => {
      (Country.find as jest.Mock).mockImplementation((code: string) => ({
        code,
        translatedName: () =>
          translationOf(`countries.${code.toLocaleLowerCase()}`),
      }));

      const stringifierMock = createMock<stringifyModule.Stringifier>();
      const stringifySpy = jest
        .spyOn(stringifyModule, 'stringify')
        .mockReturnValue(stringifierMock);

      const response = createMock<Response>();

      const datasets = [
        decisionDatasetFactory.build({
          profession: professionFactory.build({
            name: 'Example profession 1',
          }),
          organisation: organisation.build({
            name: 'Example organisation 1',
          }),
          year: 2020,
          status: DecisionDatasetStatus.Live,
          routes: [
            {
              name: 'Example route 1',
              countries: [
                {
                  code: 'CY',
                  decisions: {
                    yes: 3,
                    no: 7,
                    yesAfterComp: 9,
                    noAfterComp: 10,
                    noOtherConditions: 1,
                  },
                },
              ],
            },
          ],
        }),
        decisionDatasetFactory.build({
          profession: professionFactory.build({
            name: 'Example profession 1',
          }),
          organisation: organisation.build({
            name: 'Example organisation 2',
          }),
          year: 2022,
          status: DecisionDatasetStatus.Draft,
          routes: [
            {
              name: 'Example route 2',
              countries: [
                {
                  code: 'GB',
                  decisions: {
                    yes: 6,
                    no: 1,
                    yesAfterComp: 6,
                    noAfterComp: null,
                    noOtherConditions: 1,
                  },
                },
              ],
            },
            {
              name: 'Example route 3',
              countries: [
                {
                  code: 'JP',
                  decisions: {
                    yes: null,
                    no: 10,
                    yesAfterComp: 7,
                    noAfterComp: 5,
                    noOtherConditions: 1,
                  },
                },
              ],
            },
          ],
        }),
        decisionDatasetFactory.build({
          profession: professionFactory.build({
            name: 'Example profession 2',
          }),
          organisation: organisation.build({
            name: 'Example organisation 3',
          }),
          year: 2021,
          status: DecisionDatasetStatus.Draft,
          routes: [
            {
              name: 'Example route 4',
              countries: [
                {
                  code: 'FR',
                  decisions: {
                    yes: 7,
                    no: 7,
                    yesAfterComp: 3,
                    noAfterComp: 1,
                    noOtherConditions: 1,
                  },
                },
                {
                  code: 'PL',
                  decisions: {
                    yes: 7,
                    no: null,
                    yesAfterComp: 3,
                    noAfterComp: 5,
                    noOtherConditions: 1,
                  },
                },
              ],
            },
          ],
        }),
      ];

      const writer = new DecisionsCsvWriter(
        response,
        'example-filename',
        datasets,
        createMockI18nService(),
      );

      writer.write();

      expect(response.set).toHaveBeenCalledWith({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="example-filename.csv"`,
      });

      expect(stringifySpy).toHaveBeenCalled();

      expect(stringifierMock.write).toHaveBeenCalledTimes(6);

      expect(stringifierMock.write).toHaveBeenNthCalledWith(1, [
        translationOf('decisions.csv.heading.profession'),
        translationOf('decisions.csv.heading.organisation'),
        translationOf('decisions.csv.heading.year'),
        translationOf('decisions.csv.heading.status'),
        translationOf('decisions.csv.heading.route'),
        translationOf('decisions.csv.heading.countryName'),
        translationOf('decisions.csv.heading.countryCode'),
        translationOf('decisions.csv.heading.yes'),
        translationOf('decisions.csv.heading.yesAfterComp'),
        translationOf('decisions.csv.heading.no'),
        translationOf('decisions.csv.heading.noAfterComp'),
        translationOf('decisions.csv.heading.noOtherConditions'),
      ]);

      expect(stringifierMock.write).toHaveBeenNthCalledWith(2, [
        'Example profession 1',
        'Example organisation 1',
        '2020',
        translationOf('decisions.csv.status.live'),
        'Example route 1',
        translationOf('countries.cy'),
        'CY',
        '3',
        '9',
        '7',
        '10',
        '1',
      ]);

      expect(stringifierMock.write).toHaveBeenNthCalledWith(3, [
        'Example profession 1',
        'Example organisation 2',
        '2022',
        translationOf('decisions.csv.status.draft'),
        'Example route 2',
        translationOf('countries.gb'),
        'GB',
        '6',
        '6',
        '1',
        '',
        '1',
      ]);

      expect(stringifierMock.write).toHaveBeenNthCalledWith(4, [
        'Example profession 1',
        'Example organisation 2',
        '2022',
        translationOf('decisions.csv.status.draft'),
        'Example route 3',
        translationOf('countries.jp'),
        'JP',
        '',
        '7',
        '10',
        '5',
        '1',
      ]);

      expect(stringifierMock.write).toHaveBeenNthCalledWith(5, [
        'Example profession 2',
        'Example organisation 3',
        '2021',
        translationOf('decisions.csv.status.draft'),
        'Example route 4',
        translationOf('countries.fr'),
        'FR',
        '7',
        '3',
        '7',
        '1',
        '1',
      ]);

      expect(stringifierMock.write).toHaveBeenNthCalledWith(6, [
        'Example profession 2',
        'Example organisation 3',
        '2021',
        translationOf('decisions.csv.status.draft'),
        'Example route 4',
        translationOf('countries.pl'),
        'PL',
        '7',
        '3',
        '',
        '5',
        '1',
      ]);

      expect(stringifierMock.pipe).toHaveBeenCalledWith(response);
      expect(stringifierMock.end).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
