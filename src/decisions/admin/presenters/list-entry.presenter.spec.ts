import { TableRow } from '../../../common/interfaces/table-row';
import * as formatDateModule from '../../../common/utils';
import * as formatStatusModule from '../../../helpers/format-status.helper';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { dateOf } from '../../../testutils/date-of';
import decisionDatasetFactory from '../../../testutils/factories/decision-dataset';
import { statusOf } from '../../../testutils/status-of';
import { translationOf } from '../../../testutils/translation-of';
import { DecisionDatasetStatus } from '../../decision-dataset.entity';
import { ListEntryPresenter } from './list-entry.presenter';

describe('ListEntryPresenter', () => {
  describe('tableRow', () => {
    it('returns a table row for the given DecisionDataset', async () => {
      const formatStatusSpy = jest
        .spyOn(formatStatusModule, 'formatStatus')
        .mockImplementation(async (status) => statusOf(status));
      const formatDateSpy = jest
        .spyOn(formatDateModule, 'formatDate')
        .mockImplementation(dateOf);

      const i18nService = createMockI18nService();
      const dataset = decisionDatasetFactory.build({
        year: 2013,
        status: DecisionDatasetStatus.Draft,
        updated_at: new Date(2022, 6, 12),
      });

      const presenter = new ListEntryPresenter(dataset, i18nService);

      const expected: TableRow = [
        { text: 'Example Profession' },
        { text: '2013' },
        { text: dateOf(new Date(2022, 6, 12)) },
        { html: await statusOf(DecisionDatasetStatus.Draft) },
        {
          html: `<a class="govuk-link" href="/admin/decisions/${
            dataset.profession.id
          }/${dataset.organisation.id}/2013">${translationOf(
            'decisions.admin.dashboard.viewDetails',
          )}</a>`,
        },
      ];

      const result = await presenter.tableRow();

      expect(result).toEqual(expected);
      expect(formatStatusSpy).toBeCalledWith(
        DecisionDatasetStatus.Draft,
        i18nService,
      );
      expect(formatDateSpy).toBeCalledWith(new Date(2022, 6, 12));
    });
  });

  describe('headers', () => {
    it('returns a table row of headings', () => {
      const expected: TableRow = [
        {
          text: translationOf(
            'decisions.admin.dashboard.tableHeading.profession',
          ),
        },
        { text: translationOf('decisions.admin.dashboard.tableHeading.year') },
        {
          text: translationOf(
            'decisions.admin.dashboard.tableHeading.lastModified',
          ),
        },
        {
          text: translationOf('decisions.admin.dashboard.tableHeading.status'),
        },
        {
          text: translationOf('decisions.admin.dashboard.tableHeading.actions'),
        },
      ];

      expect(ListEntryPresenter.headings(createMockI18nService())).toEqual(
        expected,
      );
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
