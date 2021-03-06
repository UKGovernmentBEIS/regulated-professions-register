import organisationFactory from '../../../testutils/factories/organisation';
import { OrganisationsPresenter } from './organisations.presenter';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { translationOf } from '../../../testutils/translation-of';
import industryFactory from '../../../testutils/factories/industry';
import { FilterInput } from '../../../common/interfaces/filter-input.interface';
import { IndustriesCheckboxPresenter } from '../../../industries/industries-checkbox.presenter';
import { Nation } from '../../../nations/nation';
import { NationsCheckboxPresenter } from '../../../nations/nations-checkbox.presenter';
import { RegulationType } from '../../../professions/profession-version.entity';
import { OrganisationTableRowPresenter } from './organisation-table-row.presenter';

const mockTableRow = jest.fn();
const mockCheckboxItems = jest.fn();

jest.mock('./organisation-table-row.presenter', () => {
  return {
    OrganisationTableRowPresenter: jest.fn().mockImplementation(() => {
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

jest.mock('../../../nations/nations-checkbox.presenter', () => {
  return {
    NationsCheckboxPresenter: jest.fn().mockImplementation(() => {
      return {
        checkboxItems: mockCheckboxItems,
      };
    }),
  };
});

describe('OrganisationsPresenter', () => {
  describe('present', () => {
    describe('when called with empty `FilterInput`', () => {
      it('returns `IndexTemplate` template data', () => {
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

        const nations = Nation.all();
        const industries = industryFactory.buildList(3);
        const organisations = organisationFactory.buildList(5);

        const filterInput: FilterInput = {};

        const presenter = new OrganisationsPresenter(
          'Organisation Name',
          nations,
          industries,
          filterInput,
          organisations,
          i18nService,
        );
        const result = presenter.present('overview');

        expect(OrganisationTableRowPresenter).toHaveBeenCalledTimes(5);
        expect(OrganisationTableRowPresenter).toHaveBeenLastCalledWith(
          organisations[4],
          i18nService,
        );

        expect(result.view).toEqual('overview');
        expect(result.userOrganisation).toEqual('Organisation Name');

        expect(result.organisationsTable.firstCellIsHeader).toEqual(true);
        expect(result.organisationsTable.head).toEqual([
          { text: translationOf('organisations.admin.tableHeading.name') },
          {
            text: translationOf('organisations.admin.tableHeading.nations'),
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

      it('returns empty filter data', () => {
        mockTableRow.mockReturnValue([]);
        mockCheckboxItems.mockReturnValue([]);

        const i18nService = createMockI18nService();

        const nations = Nation.all();
        const industries = industryFactory.buildList(3);
        const organisations = organisationFactory.buildList(5);

        const filterInput: FilterInput = {};

        const presenter = new OrganisationsPresenter(
          'Organisation name',
          nations,
          industries,
          filterInput,
          organisations,
          i18nService,
        );

        const result = presenter.present('overview');

        expect(NationsCheckboxPresenter).toBeCalledWith(
          nations,
          [],
          i18nService,
        );

        expect(IndustriesCheckboxPresenter).toBeCalledWith(
          industries,
          [],
          i18nService,
        );

        expect(result.filters).toEqual({
          keywords: '',
          nations: [],
          industries: [],
          regulationTypes: [],
        });
      });
    });

    describe('when called with populated `FilterInput`', () => {
      describe('when called with `overview`', () => {
        it('returns populated filter data', () => {
          mockTableRow.mockReturnValue([]);
          mockCheckboxItems.mockReturnValue([]);

          const i18nService = createMockI18nService();

          const nations = Nation.all();
          const industries = industryFactory.buildList(3);
          const organisations = organisationFactory.buildList(5);

          const filterInput: FilterInput = {
            keywords: 'example keywords',
            nations: [nations[1], nations[3]],
            industries: [industries[0], industries[2]],
            regulationTypes: [
              RegulationType.Certification,
              RegulationType.Accreditation,
            ],
          };

          const presenter = new OrganisationsPresenter(
            'Organisation name',
            nations,
            industries,
            filterInput,
            organisations,
            i18nService,
          );

          const result = presenter.present('overview');

          expect(NationsCheckboxPresenter).toBeCalledWith(
            nations,
            [nations[1], nations[3]],
            i18nService,
          );

          expect(IndustriesCheckboxPresenter).toBeCalledWith(
            industries,
            [industries[0], industries[2]],
            i18nService,
          );

          expect(result.view).toEqual('overview');
          expect(result.filters).toEqual({
            keywords: 'example keywords',
            nations: [nations[1].name, nations[3].name],
            industries: [industries[0].name, industries[2].name],
            regulationTypes: [
              RegulationType.Certification,
              RegulationType.Accreditation,
            ],
          });
        });
      });

      describe('when called with `single-organisation`', () => {
        it('returns populated filter data', () => {
          mockTableRow.mockReturnValue([]);
          mockCheckboxItems.mockReturnValue([]);

          const i18nService = createMockI18nService();

          const nations = Nation.all();
          const industries = industryFactory.buildList(3);
          const organisations = organisationFactory.buildList(5);

          const filterInput: FilterInput = {
            keywords: 'example keywords',
            nations: [nations[1], nations[3]],
            industries: [industries[0], industries[2]],
            regulationTypes: [
              RegulationType.Licensing,
              RegulationType.Accreditation,
            ],
          };

          const presenter = new OrganisationsPresenter(
            'Organisation name',
            nations,
            industries,
            filterInput,
            organisations,
            i18nService,
          );

          const result = presenter.present('single-organisation');

          expect(NationsCheckboxPresenter).toBeCalledWith(
            nations,
            [nations[1], nations[3]],
            i18nService,
          );

          expect(IndustriesCheckboxPresenter).toBeCalledWith(
            industries,
            [industries[0], industries[2]],
            i18nService,
          );

          expect(result.view).toEqual('single-organisation');
          expect(result.filters).toEqual({
            keywords: 'example keywords',
            nations: [nations[1].name, nations[3].name],
            industries: [industries[0].name, industries[2].name],
            regulationTypes: [
              RegulationType.Licensing,
              RegulationType.Accreditation,
            ],
          });
        });
      });
    });

    describe('caption', () => {
      describe('when only one organisation is found', () => {
        it('uses the singular text for a caption', () => {
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

          const nations = Nation.all();
          const industries = industryFactory.buildList(3);
          const filterInput: FilterInput = {};

          const foundOrganisations = organisationFactory.buildList(1);

          const presenter = new OrganisationsPresenter(
            'Organisation name',
            nations,
            industries,
            filterInput,
            foundOrganisations,
            i18nService,
          );
          const result = presenter.present('overview');

          expect(result.organisationsTable.caption).toEqual(
            `${translationOf('organisations.search.foundSingular')}`,
          );
        });
      });

      describe('when more than one profession is found', () => {
        it('uses the plural text', () => {
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

          const nations = Nation.all();
          const industries = industryFactory.buildList(3);
          const filterInput: FilterInput = {};

          const foundOrganisations = organisationFactory.buildList(5);

          const presenter = new OrganisationsPresenter(
            'Organisation name',
            nations,
            industries,
            filterInput,
            foundOrganisations,
            i18nService,
          );
          const result = presenter.present('overview');

          expect(result.organisationsTable.caption).toEqual(
            `${translationOf('organisations.search.foundPlural')}`,
          );
        });
      });
    });
  });
});
