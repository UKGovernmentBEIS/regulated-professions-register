import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { TableRow } from '../../common/interfaces/table-row';
import { ListEntryPresenter } from './list-entry.presenter';
import industryFactory from '../../testutils/factories/industry';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { translationOf } from '../../testutils/translation-of';
import userFactory from '../../testutils/factories/user';
import { ProfessionPresenter } from '../presenters/profession.presenter';

jest.mock('../presenters/profession.presenter');

describe('ListEntryPresenter', () => {
  describe('tableRow', () => {
    it('returns a table row when called with `overview`', () => {
      const profession = professionFactory.build({
        name: 'Example Profession',
        id: 'profession-id',
        occupationLocations: ['GB-SCT', 'GB-NIR'],
        organisation: organisationFactory.build({
          name: 'Example Organisation',
        }),
        industries: [
          industryFactory.build({ name: 'industries.law' }),
          industryFactory.build({ name: 'industries.finance' }),
        ],
        status: 'live',
        changedByUser: userFactory.build({ name: 'Administrator' }),
        lastModified: new Date('12-08-2003'),
        versionId: 'version-id',
      });

      (ProfessionPresenter as jest.Mock).mockReturnValue({
        changedBy: 'Administrator',
        lastModified: '12-08-2003',
      });

      const presenter = new ListEntryPresenter(
        profession,
        createMockI18nService(),
      );

      const expected: TableRow = [
        { text: 'Example Profession' },
        {
          text: `${translationOf('nations.scotland')}, ${translationOf(
            'nations.northernIreland',
          )}`,
        },
        { text: '12-08-2003' },
        { text: 'Administrator' },
        { text: 'Example Organisation' },
        {
          text: `${translationOf('industries.law')}, ${translationOf(
            'industries.finance',
          )}`,
        },
        { text: translationOf('professions.admin.status.live') },
        {
          html: `<a href="/admin/professions/profession-id/versions/version-id">${translationOf(
            'professions.admin.viewDetails',
          )}</a>`,
        },
      ];

      expect(presenter.tableRow(`overview`)).resolves.toEqual(expected);
    });

    it('returns a table row when called with `single-organisation`', () => {
      const profession = professionFactory.build({
        name: 'Example Profession',
        id: 'profession-id',
        occupationLocations: ['GB-SCT', 'GB-NIR'],
        organisation: organisationFactory.build({
          name: 'Example Organisation',
        }),
        industries: [
          industryFactory.build({ name: 'industries.law' }),
          industryFactory.build({ name: 'industries.finance' }),
        ],
        status: 'draft',
        lastModified: new Date('12-08-2003'),
        changedByUser: userFactory.build({ name: 'Editor' }),
        versionId: 'version-id',
      });

      (ProfessionPresenter as jest.Mock).mockReturnValue({
        changedBy: 'Editor',
        lastModified: '12-08-2003',
      });

      const presenter = new ListEntryPresenter(
        profession,
        createMockI18nService(),
      );

      const expected: TableRow = [
        { text: 'Example Profession' },
        {
          text: `${translationOf('nations.scotland')}, ${translationOf(
            'nations.northernIreland',
          )}`,
        },
        { text: '12-08-2003' },
        { text: 'Editor' },
        { text: translationOf('professions.admin.status.draft') },
        {
          html: `<a href="/admin/professions/profession-id/versions/version-id">${translationOf(
            'professions.admin.viewDetails',
          )}</a>`,
        },
      ];

      expect(presenter.tableRow(`single-organisation`)).resolves.toEqual(
        expected,
      );
    });
  });

  describe('headers', () => {
    it('returns a table row of headings when called with `overview`', () => {
      const expected = [
        { text: translationOf('professions.admin.tableHeading.profession') },
        { text: translationOf('professions.admin.tableHeading.nations') },
        { text: translationOf('professions.admin.tableHeading.lastModified') },
        { text: translationOf('professions.admin.tableHeading.changedBy') },
        { text: translationOf('professions.admin.tableHeading.organisation') },
        { text: translationOf('professions.admin.tableHeading.industry') },
        { text: translationOf('professions.admin.tableHeading.status') },
        { text: translationOf('professions.admin.tableHeading.actions') },
      ];

      expect(
        ListEntryPresenter.headings(createMockI18nService(), 'overview'),
      ).resolves.toEqual(expected);
    });

    it('returns a table row of headings when called with `single-organisation`', () => {
      const expected = [
        { text: translationOf('professions.admin.tableHeading.profession') },
        { text: translationOf('professions.admin.tableHeading.nations') },
        { text: translationOf('professions.admin.tableHeading.lastModified') },
        { text: translationOf('professions.admin.tableHeading.changedBy') },
        { text: translationOf('professions.admin.tableHeading.status') },
        { text: translationOf('professions.admin.tableHeading.actions') },
      ];

      expect(
        ListEntryPresenter.headings(
          createMockI18nService(),
          'single-organisation',
        ),
      ).resolves.toEqual(expected);
    });
  });
});
