import { TableRow } from '../../../common/interfaces/table-row';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import decisionDatasetFactory from '../../../testutils/factories/decision-dataset';
import organisationFactory from '../../../testutils/factories/organisation';
import { translationOf } from '../../../testutils/translation-of';
import { IndexTemplate } from '../interfaces/index-template.interface';
import { DecisionDatasetsPresenter } from './decision-datasets.presenter';
import { ListEntryPresenter } from './list-entry.presenter';

jest.mock('./list-entry.presenter');

const mockTableRow: TableRow = [
  {
    text: 'Mock table cell',
  },
];

const mockTableHeadingRow: TableRow = [
  {
    text: 'Mock table heading cell',
  },
];

describe('DecisionDatasetsPresenter', () => {
  describe('present', () => {
    describe('when called with `single-organisation`', () => {
      it("returns a populated IndexTemplate with the user's organisation listed", async () => {
        const i18nService = createMockI18nService();

        const organisation = organisationFactory.build();
        const datasets = decisionDatasetFactory.buildList(3);

        const presenter = new DecisionDatasetsPresenter(
          organisation,
          datasets,
          i18nService,
        );

        (ListEntryPresenter.headings as jest.Mock).mockReturnValue(
          mockTableHeadingRow,
        );
        (ListEntryPresenter.prototype.tableRow as jest.Mock).mockReturnValue(
          mockTableRow,
        );

        const expected: IndexTemplate = {
          organisation: 'Example Organisation',
          decisionDatasetsTable: {
            caption: translationOf(
              'decisions.admin.dashboard.search.foundPlural',
            ),
            captionClasses: 'govuk-table__caption--m',
            firstCellIsHeader: true,
            head: mockTableHeadingRow,
            rows: [mockTableRow, mockTableRow, mockTableRow],
          },
        };

        const result = presenter.present('single-organisation');

        expect(result).toEqual(expected);
        expect(ListEntryPresenter.headings).toBeCalledWith(false, i18nService);
        expect(ListEntryPresenter.prototype.tableRow).toBeCalledTimes(3);
      });
    });

    describe('when called with `overview`', () => {
      it('returns a populated IndexTemplate with the BEIS organisation listed', async () => {
        const i18nService = createMockI18nService();

        const datasets = decisionDatasetFactory.buildList(3);

        const presenter = new DecisionDatasetsPresenter(
          null,
          datasets,
          i18nService,
        );

        (ListEntryPresenter.headings as jest.Mock).mockReturnValue(
          mockTableHeadingRow,
        );
        (ListEntryPresenter.prototype.tableRow as jest.Mock).mockReturnValue(
          mockTableRow,
        );

        const expected: IndexTemplate = {
          organisation: translationOf('app.beis'),
          decisionDatasetsTable: {
            caption: translationOf(
              'decisions.admin.dashboard.search.foundPlural',
            ),
            captionClasses: 'govuk-table__caption--m',
            firstCellIsHeader: true,
            head: mockTableHeadingRow,
            rows: [mockTableRow, mockTableRow, mockTableRow],
          },
        };

        const result = presenter.present('overview');

        expect(result).toEqual(expected);
        expect(ListEntryPresenter.headings).toBeCalledWith(true, i18nService);
        expect(ListEntryPresenter.prototype.tableRow).toBeCalledTimes(3);
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
