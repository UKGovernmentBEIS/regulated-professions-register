import { DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../../common/create-mock-i18n-service';
import { TableRow } from '../../../common/interfaces/table-row';
import { Industry } from '../../../industries/industry.entity';
import { Organisation } from '../../../organisations/organisation.entity';
import { Profession } from '../../profession.entity';
import { ListEntryPresenter } from './list-entry.presenter';

describe('ListEntryPresenter', () => {
  let i18nService: DeepMocked<I18nService>;

  let presenter: ListEntryPresenter;

  beforeEach(() => {
    i18nService = createMockI18nService({
      'nations.scotland': 'Scotland',
      'nations.northernIreland': 'Northern Ireland',
      'industries.law': 'Law',
      'industires.finance': 'Finance',
      'professions-list.status.published': 'Published',
      'professions-list.viewDetails': 'View details',
      'professions-list.tableHeading.profession': 'Profession',
      'professions-list.tableHeading.id': 'ID',
      'professions-list.tableHeading.nations': 'Nations',
      'professions-list.tableHeading.lastModified': 'Last modified',
      'professions-list.tableHeading.changedBy': 'Changed by',
      'professions-list.tableHeading.organisation': 'Regulators',
      'professions-list.tableHeading.industry': 'Industry / sector',
      'professions-list.tableHeading.status': 'Status',
      'professions-list.tableHeading.actions': 'Actions',
    });

    const profession = new Profession('Example Profession');

    profession.slug = 'example-profession';
    profession.occupationLocations = ['GB-SCT', 'GB-NIR'];
    profession.organisation = new Organisation('Example Organisation');
    profession.industries = [
      new Industry('industries.law'),
      new Industry('industires.finance'),
    ];
    profession.updated_at = new Date(2003, 7, 12);

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
