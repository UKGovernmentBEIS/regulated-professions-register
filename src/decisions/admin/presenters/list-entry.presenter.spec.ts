import * as formatDateModule from '../../../common/utils';
import * as formatStatusModule from '../../../helpers/format-status.helper';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { dateOf } from '../../../testutils/date-of';
import decisionDatasetFactory from '../../../testutils/factories/decision-dataset';
import organisationFactory from '../../../testutils/factories/organisation';
import professionFactory from '../../../testutils/factories/profession';
import { statusOf } from '../../../testutils/status-of';
import { translationOf } from '../../../testutils/translation-of';
import { DecisionDatasetStatus } from '../../decision-dataset.entity';
import { ListEntryPresenter } from './list-entry.presenter';

describe('ListEntryPresenter', () => {
  describe('tableRow', () => {
    describe('when called with `overview`', () => {
      it('returns a table row for the given DecisionDataset with the overview columns', async () => {
        const formatStatusSpy = jest
          .spyOn(formatStatusModule, 'formatStatus')
          .mockImplementation((status) => statusOf(status));
        const formatDateSpy = jest
          .spyOn(formatDateModule, 'formatDate')
          .mockImplementation(dateOf);

        const i18nService = createMockI18nService();
        const dataset = decisionDatasetFactory.build({
          organisation: organisationFactory.build({
            name: 'Example Organisation',
          }),
          profession: professionFactory.build({ name: 'Example Profession' }),
          year: 2013,
          status: DecisionDatasetStatus.Draft,
          updated_at: new Date(2022, 6, 12),
        });

        const presenter = new ListEntryPresenter(dataset, i18nService);

        expect(presenter.tableRow('overview')).toEqual([
          { text: 'Example Profession' },
          { text: 'Example Organisation' },
          { text: '2013' },
          { text: dateOf(new Date(2022, 6, 12)) },
          { html: statusOf(DecisionDatasetStatus.Draft) },
          {
            html: `<a class="govuk-link" href="/admin/decisions/${
              dataset.profession.id
            }/${dataset.organisation.id}/2013">${translationOf(
              'decisions.admin.dashboard.viewDetails',
            )}</a>`,
          },
        ]);

        expect(formatStatusSpy).toBeCalledWith(
          DecisionDatasetStatus.Draft,
          i18nService,
        );
        expect(formatDateSpy).toBeCalledWith(new Date(2022, 6, 12));
      });
    });

    describe('when called with `single-organisation`', () => {
      it('returns a table row for the given DecisionDataset with the columns for a single organisation', async () => {
        const formatStatusSpy = jest
          .spyOn(formatStatusModule, 'formatStatus')
          .mockImplementation((status) => statusOf(status));
        const formatDateSpy = jest
          .spyOn(formatDateModule, 'formatDate')
          .mockImplementation(dateOf);

        const i18nService = createMockI18nService();
        const dataset = decisionDatasetFactory.build({
          profession: professionFactory.build({ name: 'Example Profession' }),
          year: 2013,
          status: DecisionDatasetStatus.Draft,
          updated_at: new Date(2022, 6, 12),
        });

        const presenter = new ListEntryPresenter(dataset, i18nService);

        const result = presenter.tableRow('single-organisation');

        expect(result).toEqual([
          { text: 'Example Profession' },
          { text: '2013' },
          { text: dateOf(new Date(2022, 6, 12)) },
          { html: statusOf(DecisionDatasetStatus.Draft) },
          {
            html: `<a class="govuk-link" href="/admin/decisions/${
              dataset.profession.id
            }/${dataset.organisation.id}/2013">${translationOf(
              'decisions.admin.dashboard.viewDetails',
            )}</a>`,
          },
        ]);

        expect(formatStatusSpy).toBeCalledWith(
          DecisionDatasetStatus.Draft,
          i18nService,
        );
        expect(formatDateSpy).toBeCalledWith(new Date(2022, 6, 12));
      });
    });
  });

  describe('headers', () => {
    describe('when called with `overview`', () => {
      it('returns a table row of headings including the overview headings', () => {
        expect(
          ListEntryPresenter.headings(createMockI18nService(), 'overview'),
        ).toEqual([
          {
            text: translationOf(
              'decisions.admin.dashboard.tableHeading.profession',
            ),
          },
          {
            text: translationOf(
              'decisions.admin.dashboard.tableHeading.regulator',
            ),
          },
          {
            text: translationOf('decisions.admin.dashboard.tableHeading.year'),
          },
          {
            text: translationOf(
              'decisions.admin.dashboard.tableHeading.lastModified',
            ),
          },
          {
            text: translationOf(
              'decisions.admin.dashboard.tableHeading.status',
            ),
          },
          {
            text: translationOf(
              'decisions.admin.dashboard.tableHeading.actions',
            ),
          },
        ]);
      });
    });

    describe('when called with `single-organisation`', () => {
      it('returns a table row of headings including the headings for a single organisation', () => {
        expect(
          ListEntryPresenter.headings(
            createMockI18nService(),
            'single-organisation',
          ),
        ).toEqual([
          {
            text: translationOf(
              'decisions.admin.dashboard.tableHeading.profession',
            ),
          },
          {
            text: translationOf('decisions.admin.dashboard.tableHeading.year'),
          },
          {
            text: translationOf(
              'decisions.admin.dashboard.tableHeading.lastModified',
            ),
          },
          {
            text: translationOf(
              'decisions.admin.dashboard.tableHeading.status',
            ),
          },
          {
            text: translationOf(
              'decisions.admin.dashboard.tableHeading.actions',
            ),
          },
        ]);
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
