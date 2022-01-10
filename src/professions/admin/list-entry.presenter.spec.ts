import { DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { TableRow } from '../../common/interfaces/table-row';
import { ListEntryPresenter } from './list-entry.presenter';
import industryFactory from '../../testutils/factories/industry';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';

describe('ListEntryPresenter', () => {
  let i18nService: DeepMocked<I18nService>;

  let presenter: ListEntryPresenter;

  beforeEach(() => {
    i18nService = createMockI18nService({
      'nations.scotland': 'Scotland',
      'nations.northernIreland': 'Northern Ireland',
      'industries.law': 'Law',
      'industries.finance': 'Finance',
      'professions.admin.status.published': 'Published',
      'professions.admin.viewDetails': 'View details',
      'professions.admin.tableHeading.profession': 'Profession',
      'professions.admin.tableHeading.id': 'ID',
      'professions.admin.tableHeading.nations': 'Nations',
      'professions.admin.tableHeading.lastModified': 'Last modified',
      'professions.admin.tableHeading.changedBy': 'Changed by',
      'professions.admin.tableHeading.organisation': 'Regulators',
      'professions.admin.tableHeading.industry': 'Industry / sector',
      'professions.admin.tableHeading.status': 'Status',
      'professions.admin.tableHeading.actions': 'Actions',
    });

    const profession = professionFactory.build({
      name: 'Example Profession',
      slug: 'example-profession',
      occupationLocations: ['GB-SCT', 'GB-NIR'],
      organisation: organisationFactory.build({ name: 'Example Organisation' }),
      industries: [
        industryFactory.build({ name: 'industries.law' }),
        industryFactory.build({ name: 'industries.finance' }),
      ],
      updated_at: new Date(2003, 7, 12),
    });

    presenter = new ListEntryPresenter(profession, i18nService);
  });

  describe('tableRow', () => {
    it('returns a table row when called with `overview`', () => {
      const expected: TableRow = [
        { text: 'Example Profession' },
        { text: 'PLCH0LD3R' },
        { text: 'Scotland, Northern Ireland' },
        { text: '12-08-2003' },
        { text: 'Example Organisation' },
        { text: 'Law, Finance' },
        { text: 'Published' },
        { html: '<a href="/professions/example-profession">View details</a>' },
      ];

      expect(presenter.tableRow(`overview`)).resolves.toEqual(expected);
    });

    it('returns a table row when called with `single-organisation`', () => {
      const expected: TableRow = [
        { text: 'Example Profession' },
        { text: 'PLCH0LD3R' },
        { text: 'Scotland, Northern Ireland' },
        { text: '12-08-2003' },
        { text: 'Placeholder name' },
        { text: 'Published' },
        { html: '<a href="/professions/example-profession">View details</a>' },
      ];

      expect(presenter.tableRow(`single-organisation`)).resolves.toEqual(
        expected,
      );
    });
  });

  describe('headers', () => {
    it('returns a table row of headings when called with `overview`', () => {
      const expected = [
        { text: 'Profession' },
        { text: 'ID' },
        { text: 'Nations' },
        { text: 'Last modified' },
        { text: 'Regulators' },
        { text: 'Industry / sector' },
        { text: 'Status' },
        { text: 'Actions' },
      ];

      expect(
        ListEntryPresenter.headings(i18nService, 'overview'),
      ).resolves.toEqual(expected);
    });

    it('returns a table row of headings when called with `single-organisation`', () => {
      const expected = [
        { text: 'Profession' },
        { text: 'ID' },
        { text: 'Nations' },
        { text: 'Last modified' },
        { text: 'Changed by' },
        { text: 'Status' },
        { text: 'Actions' },
      ];

      expect(
        ListEntryPresenter.headings(i18nService, 'single-organisation'),
      ).resolves.toEqual(expected);
    });
  });
});
