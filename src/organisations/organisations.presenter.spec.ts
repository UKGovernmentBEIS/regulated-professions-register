import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';

import organisationFactory from '../testutils/factories/organisation';
import { OrganisationsPresenter } from './organisations.presenter';

const mockTableRow = () => {
  return [
    {
      text: 'Some text',
    },
  ];
};

jest.mock('./organisation.presenter', () => {
  return {
    OrganisationPresenter: jest.fn().mockImplementation(() => {
      return {
        tableRow: mockTableRow,
      };
    }),
  };
});

describe('OrganisationsPresenter', () => {
  const i18nService: DeepMocked<I18nService> = createMock<I18nService>({
    translate: async (key: string) => {
      return key;
    },
  });

  describe('table', () => {
    it('returns data for a table', async () => {
      const organisations = organisationFactory.buildList(5);
      const presenter = new OrganisationsPresenter(organisations, i18nService);
      const table = await presenter.table();

      expect(table.firstCellIsHeader).toEqual(true);
      expect(table.head).toEqual([
        { text: 'organisations.admin.tableHeading.name' },
        { text: 'organisations.admin.tableHeading.alternateName' },
        { text: 'organisations.admin.tableHeading.industries' },
        { text: 'organisations.admin.tableHeading.actions' },
      ]);
      expect(table.rows).toEqual([
        mockTableRow(),
        mockTableRow(),
        mockTableRow(),
        mockTableRow(),
        mockTableRow(),
      ]);
    });
  });
});
