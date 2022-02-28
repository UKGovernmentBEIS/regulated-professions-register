import organisationFactory from '../../../testutils/factories/organisation';
import { OrganisationsPresenter } from './organisations.presenter';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { translationOf } from '../../../testutils/translation-of';
import industryFactory from '../../../testutils/factories/industry';
import { FilterInput } from '../../../common/interfaces/filter-input.interface';
import { IndustriesCheckboxPresenter } from '../../../industries/industries-checkbox.presenter';
import { OrganisationPresenter } from '../../presenters/organisation.presenter';

const mockTableRow = jest.fn();
const mockCheckboxItems = jest.fn();

jest.mock('../../presenters/organisation.presenter', () => {
  return {
    OrganisationPresenter: jest.fn().mockImplementation(() => {
      return {
        tableRow: mockTableRow,
      };
    }),
  };
});

jest.mock('../../../industries/industries-checkbox.presenter', () => {
  return {
    IndustriesCheckboxPresenter: jest.fn().mockImplementation(() => {
      return {
        checkboxItems: mockCheckboxItems,
      };
    }),
  };
});

describe('OrganisationsPresenter', () => {
  describe('present', () => {
    describe('when called with empty `FilterInput`', () => {
      it('returns `IndexTemplate` template data', async () => {
        mockTableRow.mockReturnValue([
          {
            text: 'Some text',
          },
        ]);

        mockCheckboxItems.mockReturnValue([
          {
            text: 'Some text',
            value: 'Some value',
            checked: true,
          },
        ]);

        const i18nService = createMockI18nService();

        const industries = industryFactory.buildList(3);
        const organisations = organisationFactory.buildList(5);

        const filterInput: FilterInput = {};

        const presenter = new OrganisationsPresenter(
          industries,
          filterInput,
          organisations,
          i18nService,
        );
        const result = await presenter.present();

        expect(OrganisationPresenter).toHaveBeenCalledTimes(5);
        expect(OrganisationPresenter).toHaveBeenLastCalledWith(
          organisations[4],
          i18nService,
        );

        expect(result.organisationsTable.firstCellIsHeader).toEqual(true);
        expect(result.organisationsTable.head).toEqual([
          { text: translationOf('organisations.admin.tableHeading.name') },
          {
            text: translationOf(
              'organisations.admin.tableHeading.alternateName',
            ),
          },
          {
            text: translationOf('organisations.admin.tableHeading.industries'),
          },
          {
            text: translationOf(
              'organisations.admin.tableHeading.lastModified',
            ),
          },
          {
            text: translationOf('organisations.admin.tableHeading.changedBy'),
          },
          {
            text: translationOf('organisations.admin.tableHeading.status'),
          },
          { text: translationOf('organisations.admin.tableHeading.actions') },
        ]);
        expect(result.organisationsTable.rows).toEqual([
          mockTableRow(),
          mockTableRow(),
          mockTableRow(),
          mockTableRow(),
          mockTableRow(),
        ]);

        expect(result.industriesCheckboxItems).toEqual(mockCheckboxItems());
      });

      it('returns empty filter data', async () => {
        mockTableRow.mockReturnValue([]);
        mockCheckboxItems.mockReturnValue([]);

        const i18nService = createMockI18nService();

        const industries = industryFactory.buildList(3);
        const organisations = organisationFactory.buildList(5);

        const filterInput: FilterInput = {};

        const presenter = new OrganisationsPresenter(
          industries,
          filterInput,
          organisations,
          i18nService,
        );

        const result = await presenter.present();

        expect(IndustriesCheckboxPresenter).toBeCalledWith(
          industries,
          [],
          i18nService,
        );

        expect(result.filters).toEqual({
          keywords: '',
          industries: [],
        });
      });
    });

    describe('when called with populated `FilterInput`', () => {
      it('returns populated filter data', async () => {
        mockTableRow.mockReturnValue([]);
        mockCheckboxItems.mockReturnValue([]);

        const i18nService = createMockI18nService();

        const industries = industryFactory.buildList(3);
        const organisations = organisationFactory.buildList(5);

        const filterInput: FilterInput = {
          keywords: 'example keywords',
          industries: [industries[0], industries[2]],
        };

        const presenter = new OrganisationsPresenter(
          industries,
          filterInput,
          organisations,
          i18nService,
        );

        const result = await presenter.present();

        expect(IndustriesCheckboxPresenter).toBeCalledWith(
          industries,
          [industries[0], industries[2]],
          i18nService,
        );

        expect(result.filters).toEqual({
          keywords: 'example keywords',
          industries: [industries[0].name, industries[2].name],
        });
      });
    });

    describe('caption', () => {
      describe('when only one organisation is found', () => {
        it('uses the singular text for a caption', async () => {
          mockTableRow.mockReturnValue([
            {
              text: 'Some text',
            },
          ]);

          mockCheckboxItems.mockReturnValue([
            {
              text: 'Some text',
              value: 'Some value',
              checked: true,
            },
          ]);

          const i18nService = createMockI18nService();
          const industries = industryFactory.buildList(3);
          const filterInput: FilterInput = {};

          const foundOrganisations = organisationFactory.buildList(1);

          const presenter = new OrganisationsPresenter(
            industries,
            filterInput,
            foundOrganisations,
            i18nService,
          );
          const result = await presenter.present();

          expect(result.organisationsTable.caption).toEqual(
            `${translationOf('organisations.search.foundSingular')}`,
          );
        });
      });

      describe('when more than one profession is found', () => {
        it('uses the plural text', async () => {
          mockTableRow.mockReturnValue([
            {
              text: 'Some text',
            },
          ]);

          mockCheckboxItems.mockReturnValue([
            {
              text: 'Some text',
              value: 'Some value',
              checked: true,
            },
          ]);

          const i18nService = createMockI18nService();
          const industries = industryFactory.buildList(3);
          const filterInput: FilterInput = {};

          const foundOrganisations = organisationFactory.buildList(5);

          const presenter = new OrganisationsPresenter(
            industries,
            filterInput,
            foundOrganisations,
            i18nService,
          );
          const result = await presenter.present();

          expect(result.organisationsTable.caption).toEqual(
            `${translationOf('organisations.search.foundPlural')}`,
          );
        });
      });
    });
  });
});
