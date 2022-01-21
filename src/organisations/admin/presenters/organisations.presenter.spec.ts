import { DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';

import organisationFactory from '../../../testutils/factories/organisation';
import { OrganisationsPresenter } from './organisations.presenter';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { translationOf } from '../../../testutils/translation-of';

const mockTableRow = () => {
  return [
    {
      text: 'Some text',
    },
  ];
};

jest.mock('../../presenters/organisation.presenter', () => {
  return {
    OrganisationPresenter: jest.fn().mockImplementation(() => {
      return {
        tableRow: mockTableRow,
      };
    }),
  };
});

describe('OrganisationsPresenter', () => {
  const i18nService: DeepMocked<I18nService> = createMockI18nService();

  describe('table', () => {
    it('returns data for a table', async () => {
      const organisations = organisationFactory.buildList(5);
      const presenter = new OrganisationsPresenter(organisations, i18nService);
      const table = await presenter.table();

      expect(table.firstCellIsHeader).toEqual(true);
      expect(table.head).toEqual([
        { text: translationOf('organisations.admin.tableHeading.name') },
        {
          text: translationOf('organisations.admin.tableHeading.alternateName'),
        },
        {
          text: translationOf('organisations.admin.tableHeading.industries'),
        },
        { text: translationOf('organisations.admin.tableHeading.actions') },
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
