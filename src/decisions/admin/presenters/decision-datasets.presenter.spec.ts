import { CheckboxItems } from '../../../common/interfaces/checkbox-items.interface';
import { FilterInput } from '../../../common/interfaces/filter-input.interface';
import { TableRow } from '../../../common/interfaces/table-row';
import { OrganisationsCheckboxPresenter } from '../../../organisations/organisations-checkbox-presenter';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import decisionDatasetFactory from '../../../testutils/factories/decision-dataset';
import organisationFactory from '../../../testutils/factories/organisation';
import { translationOf } from '../../../testutils/translation-of';
import { DecisionDatasetStatus } from '../../decision-dataset.entity';
import { IndexTemplate } from '../interfaces/index-template.interface';
import { DecisionDatasetStatusesCheckboxPresenter } from './decision-dataset-statuses-checkbox.presenter';
import { DecisionDatasetsPresenter } from './decision-datasets.presenter';
import { ListEntryPresenter } from './list-entry.presenter';
import { YearsCheckboxPresenter } from './years-checkbox.presenter';

jest.mock('./list-entry.presenter');
jest.mock('./years-checkbox.presenter');
jest.mock('../../../organisations/organisations-checkbox-presenter');
jest.mock('./decision-dataset-statuses-checkbox.presenter');

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

const mockOrganisationsCheckboxItems: CheckboxItems[] = [
  {
    text: 'Mock organisation',
    value: '',
    checked: false,
  },
];

const mockYearsCheckboxItems: CheckboxItems[] = [
  {
    text: '2020',
    value: '2020',
    checked: false,
  },
];

const mockStatusesCheckboxItems: CheckboxItems[] = [
  {
    text: DecisionDatasetStatus.Draft,
    value: DecisionDatasetStatus.Draft,
    checked: false,
  },
];

describe('DecisionDatasetsPresenter', () => {
  describe('present', () => {
    describe('when called with `single-organisation`', () => {
      it("returns a populated IndexTemplate with the user's organisation listed", async () => {
        const filterInput: FilterInput = {
          keywords: 'Teacher Engineer',
          years: [2020, 2021],
          statuses: [DecisionDatasetStatus.Draft],
        };

        const i18nService = createMockI18nService();

        const userOrganisation = organisationFactory.build();
        const datasets = decisionDatasetFactory.buildList(3);
        const allOrganisations = organisationFactory.buildList(3);

        const presenter = new DecisionDatasetsPresenter(
          filterInput,
          userOrganisation,
          allOrganisations,
          2020,
          2023,
          datasets,
          i18nService,
        );

        (ListEntryPresenter.headings as jest.Mock).mockReturnValue(
          mockTableHeadingRow,
        );
        (ListEntryPresenter.prototype.tableRow as jest.Mock).mockReturnValue(
          mockTableRow,
        );

        (
          OrganisationsCheckboxPresenter.prototype.checkboxItems as jest.Mock
        ).mockReturnValue(mockOrganisationsCheckboxItems);

        (
          YearsCheckboxPresenter.prototype.checkboxItems as jest.Mock
        ).mockReturnValue(mockYearsCheckboxItems);

        (
          DecisionDatasetStatusesCheckboxPresenter.prototype
            .checkboxItems as jest.Mock
        ).mockReturnValue(mockStatusesCheckboxItems);

        const expected: IndexTemplate = {
          view: 'single-organisation',
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
          filters: {
            keywords: 'Teacher Engineer',
            organisations: [],
            years: [2020, 2021],
            statuses: [DecisionDatasetStatus.Draft],
          },
          organisationsCheckboxItems: mockOrganisationsCheckboxItems,
          yearsCheckboxItems: mockYearsCheckboxItems,
          statusesCheckboxItems: mockStatusesCheckboxItems,
        };

        const result = presenter.present('single-organisation');

        expect(result).toEqual(expected);

        expect(ListEntryPresenter.headings).toBeCalledWith(false, i18nService);
        expect(ListEntryPresenter.prototype.tableRow).toBeCalledTimes(3);

        expect(OrganisationsCheckboxPresenter).toHaveBeenCalledWith(
          allOrganisations,
          [],
        );
        expect(
          OrganisationsCheckboxPresenter.prototype.checkboxItems,
        ).toHaveBeenCalled();

        expect(YearsCheckboxPresenter).toHaveBeenCalledWith(
          2020,
          2023,
          [2020, 2021],
        );
        expect(
          YearsCheckboxPresenter.prototype.checkboxItems,
        ).toHaveBeenCalled();

        expect(DecisionDatasetStatusesCheckboxPresenter).toHaveBeenCalledWith(
          [DecisionDatasetStatus.Draft],
          i18nService,
        );
        expect(
          DecisionDatasetStatusesCheckboxPresenter.prototype.checkboxItems,
        ).toHaveBeenCalled();
      });
    });

    describe('when called with `overview`', () => {
      it('returns a populated IndexTemplate with the BEIS organisation listed', async () => {
        const filterOrganisation = organisationFactory.build({
          name: 'Filtered Organisation',
        });

        const filterInput: FilterInput = {
          keywords: 'Attorny',
          organisations: [filterOrganisation],
          years: [2021, 2022],
          statuses: [DecisionDatasetStatus.Draft, DecisionDatasetStatus.Live],
        };

        const i18nService = createMockI18nService();

        const datasets = decisionDatasetFactory.buildList(3);
        const allOrganisations = organisationFactory.buildList(3);

        const presenter = new DecisionDatasetsPresenter(
          filterInput,
          null,
          allOrganisations,
          2020,
          2023,
          datasets,
          i18nService,
        );

        (ListEntryPresenter.headings as jest.Mock).mockReturnValue(
          mockTableHeadingRow,
        );
        (ListEntryPresenter.prototype.tableRow as jest.Mock).mockReturnValue(
          mockTableRow,
        );

        (
          OrganisationsCheckboxPresenter.prototype.checkboxItems as jest.Mock
        ).mockReturnValue(mockOrganisationsCheckboxItems);

        (
          YearsCheckboxPresenter.prototype.checkboxItems as jest.Mock
        ).mockReturnValue(mockYearsCheckboxItems);

        (
          DecisionDatasetStatusesCheckboxPresenter.prototype
            .checkboxItems as jest.Mock
        ).mockReturnValue(mockStatusesCheckboxItems);

        const expected: IndexTemplate = {
          view: 'overview',
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
          filters: {
            keywords: 'Attorny',
            organisations: ['Filtered Organisation'],
            years: [2021, 2022],
            statuses: [DecisionDatasetStatus.Draft, DecisionDatasetStatus.Live],
          },
          organisationsCheckboxItems: mockOrganisationsCheckboxItems,
          yearsCheckboxItems: mockYearsCheckboxItems,
          statusesCheckboxItems: mockStatusesCheckboxItems,
        };

        const result = presenter.present('overview');

        expect(result).toEqual(expected);

        expect(ListEntryPresenter.headings).toBeCalledWith(true, i18nService);
        expect(ListEntryPresenter.prototype.tableRow).toBeCalledTimes(3);

        expect(OrganisationsCheckboxPresenter).toHaveBeenCalledWith(
          allOrganisations,
          [filterOrganisation],
        );
        expect(
          OrganisationsCheckboxPresenter.prototype.checkboxItems,
        ).toHaveBeenCalled();

        expect(YearsCheckboxPresenter).toHaveBeenCalledWith(
          2020,
          2023,
          [2021, 2022],
        );
        expect(
          YearsCheckboxPresenter.prototype.checkboxItems,
        ).toHaveBeenCalled();

        expect(DecisionDatasetStatusesCheckboxPresenter).toHaveBeenCalledWith(
          [DecisionDatasetStatus.Draft, DecisionDatasetStatus.Live],
          i18nService,
        );
        expect(
          DecisionDatasetStatusesCheckboxPresenter.prototype.checkboxItems,
        ).toHaveBeenCalled();
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
